export type Methods = {
  post: {
    reqBody: {
      liveId: number;
      watchToken: string;
      serverToken: string;
    };

    resBody: {
      success: boolean;
    };
  };
};
