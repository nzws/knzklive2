import { LivePublic } from 'api-types/common/types';
import { Methods as PushAction } from 'api-types/push/api/externals/v1/action';
import { Methods as ThumbnailApi } from 'api-types/push/api/externals/v1/thumbnail';
import { Queue, Worker } from 'bullmq';
import { images, lives } from '../../models';
import { queueRedis } from '../redis/_client';

interface Job {
  name: string;
  data: {
    url: string;
    postBody?: Record<string, unknown>;
    data?: unknown;
    timeout?: number;
  };
}

interface JobUserLiveStarted extends Job {
  name: 'user:live:started';
  data: {
    url: string;
    postBody: {
      type: 'live:started';
      live: LivePublic;
    };
  };
}

interface JobSystemClearISR extends Job {
  name: 'system:clear:isr';
  data: {
    url: string;
    postBody: {
      url: string;
    };
  };
}

interface JobSystemPushThumbnail extends Job {
  name: 'system:push:thumbnail';
  data: {
    url: string;
    postBody: ThumbnailApi['post']['reqBody'];
    data: {
      storageKey: string;
    };
    timeout: number;
  };
}

interface JobSystemPushAction extends Job {
  name: 'system:push:action';
  data: {
    url: string;
    postBody: PushAction['post']['reqBody'];
    timeout: number;
  };
}

export type JobData =
  | JobUserLiveStarted
  | JobSystemClearISR
  | JobSystemPushThumbnail
  | JobSystemPushAction;

type JobResult = {
  success: boolean;
  message?: string;
};

const name = 'webhook';

export const webhookQueue = new Queue<
  JobData['data'],
  JobResult,
  JobData['name']
>(name, {
  connection: queueRedis,
  defaultJobOptions: {
    removeOnComplete: 20,
    removeOnFail: 20
  }
});

const doPostAction = async <U extends JobData>(
  name: U['name'],
  item: U['data']
) => {
  if (name === 'system:generate:thumbnail') {
    const { postBody, data } = item as JobSystemGenerateThumbnail['data'];
    const live = await lives.get(postBody.liveId);
    if (!live) {
      throw new Error('Live not found');
    }
    await images.createForGeneratedLiveThumbnail(live, data.storageKey);
  }
};

export const webhookWorker = new Worker<
  JobData['data'],
  JobResult,
  JobData['name']
>(
  name,
  async job => {
    const { url, postBody, timeout } = job.data as Job['data'];

    const abort = new AbortController();

    const cleanup = setTimeout(() => {
      abort.abort();
    }, timeout || 5000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: postBody ? JSON.stringify(postBody) : undefined,
        signal: abort.signal
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
    } finally {
      clearTimeout(cleanup);
    }

    await doPostAction(job.name, job.data);

    return { success: true };
  },
  { connection: queueRedis }
);
