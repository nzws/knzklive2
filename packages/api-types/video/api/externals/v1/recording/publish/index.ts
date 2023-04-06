export type Methods = {
  post: {
    reqBody: {
      liveId: number;
      watchToken: string;
      serverToken: string;
      downloadUrl: string;
      // bigint
      originalBytes: string;
    };

    resBody: {
      success: boolean;
    };
  };
};
