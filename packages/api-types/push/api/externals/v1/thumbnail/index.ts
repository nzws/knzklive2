export type Methods = {
  post: {
    reqBody: {
      liveId: number;
      serverToken: string;
      signedUploadUrl: string;
    };

    resBody: {
      success: boolean;
    };
  };
};
