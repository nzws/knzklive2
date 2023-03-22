export type Methods = {
  post: {
    reqBody: {
      domain?: string;
      misskeyToken?: string;
      liveToken?: string;
    };

    resBody: { success: boolean };
  };
};
