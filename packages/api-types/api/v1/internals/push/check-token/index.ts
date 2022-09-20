export type Methods = {
  post: {
    reqBody: {
      liveId: number;
      watchToken: string;
      pushToken: string;
      serverToken: string;
    };

    resBody: {
      success: boolean;
    };
  };
};
