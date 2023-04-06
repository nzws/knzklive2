type Event = 'end' | 'start';

export type Methods = {
  post: {
    reqBody: {
      liveId: number;
      action: Event;
      serverToken: string;
      // start
      isRecording?: boolean;
    };

    resBody: {
      success: boolean;
    };
  };
};
