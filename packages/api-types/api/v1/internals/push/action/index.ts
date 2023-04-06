export type Event =
  | 'stream:start'
  | 'stream:stop'
  | 'record:processing'
  | 'record:done'
  | 'record:failed';

export type Methods = {
  post: {
    reqBody: {
      liveId: number;
      action: Event;
      serverToken: string;
      // record:done
      recordingKey?: string;
      fileSize?: string;
    };

    resBody: {
      success: boolean;
    };
  };
};
