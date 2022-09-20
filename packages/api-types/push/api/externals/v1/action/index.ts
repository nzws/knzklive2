type Event = 'end';

export type Methods = {
  post: {
    reqBody: {
      liveId: number;
      action: Event;
      serverToken: string;
    };

    resBody: {
      success: boolean;
    };
  };
};
