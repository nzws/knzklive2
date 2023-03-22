export type Methods = {
  post: {
    reqBody: {
      domain: string;
      session: string;
    };

    resBody: {
      misskeyToken: string;
      liveToken: string;
    };
  };
};
