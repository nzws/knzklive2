export type Methods = {
  post: {
    reqBody: {
      liveId: number;
      watchToken: string;
      serverToken: string;
      originalUrl: string;
      // bigint
      originalBytes: string;
    };

    resBody: {
      success: boolean;
    };
  };
};
