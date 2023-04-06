import { LivePublic } from 'api-types/common/types';
import { Methods as PushAction } from 'api-types/push/api/externals/v1/action';
import { Methods as ThumbnailApi } from 'api-types/push/api/externals/v1/thumbnail';
import { Methods as VideoPublish } from 'api-types/video/api/externals/v1/recording/publish';
import { Methods as VideoUnPublish } from 'api-types/video/api/externals/v1/recording/unpublish';

export interface Job {
  name: string;
  data: {
    url: string;
    postBody?: Record<string, unknown>;
    data?: unknown;
    timeout?: number;
  };
}

export interface JobUserLiveStarted extends Job {
  name: 'user:live:started';
  data: {
    url: string;
    postBody: {
      type: 'live:started';
      live: LivePublic;
    };
  };
}

export interface JobSystemClearISR extends Job {
  name: 'system:clear:isr';
  data: {
    url: string;
    postBody: {
      url: string;
    };
  };
}

export interface JobSystemPushThumbnail extends Job {
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

export interface JobSystemPushAction extends Job {
  name: 'system:push:action';
  data: {
    url: string;
    postBody: PushAction['post']['reqBody'];
    timeout: number;
  };
}

export interface JobSystemWebRevalidate extends Job {
  name: 'system:web:revalidate';
  data: {
    url: string;
    postBody: {
      data: {
        paths: string[];
      };
      signature: string;
    };
  };
}

export interface JobSystemVideoPublish extends Job {
  name: 'system:video:publish';
  data: {
    url: string;
    postBody: VideoPublish['post']['reqBody'];
    timeout: number;
  };
}

export interface JobSystemVideoUnPublish extends Job {
  name: 'system:video:unpublish';
  data: {
    url: string;
    postBody: VideoUnPublish['post']['reqBody'];
    timeout: number;
  };
}

export type JobData =
  | JobUserLiveStarted
  | JobSystemClearISR
  | JobSystemPushThumbnail
  | JobSystemPushAction
  | JobSystemWebRevalidate
  | JobSystemVideoPublish
  | JobSystemVideoUnPublish;
