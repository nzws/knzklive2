export type Event =
  | 'record:processing'
  | 'record:done'
  | 'record:failed'
  | 'record:deleted';

export type Methods = {
  post: {
    reqBody: {
      liveId: number;
      action: Event;
      serverToken: string;
      // record:done
      cacheSize?: string;
      // record:done, record:failed
      type?: 'hq';
    };

    resBody: {
      success: boolean;
    };
  };
};
