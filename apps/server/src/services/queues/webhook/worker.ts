import { Queue, Worker } from 'bullmq';
import { images, lives } from '../../../models';
import { queueRedis } from '../../redis/_client';
import { JobData, JobSystemPushThumbnail, Job } from './types';

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
  if (name === 'system:push:thumbnail') {
    const { postBody, data } = item as JobSystemPushThumbnail['data'];
    const live = await lives.get(postBody.liveId);
    if (!live) {
      throw new Error('Live not found');
    }
    await images.createForGeneratedLiveThumbnail(live, data.storageKey);
  } else {
    // do nothing
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

      await doPostAction(job.name, job.data);
      return { success: true };
    } finally {
      clearTimeout(cleanup);
    }
  },
  { connection: queueRedis }
);
