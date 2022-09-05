export type Methods = {
  post: {
    reqBody: {
      domain: string;
      code: string;
    };

    resBody: {
      mastodonToken: string;
      liveToken: string;
    };
  };
};
