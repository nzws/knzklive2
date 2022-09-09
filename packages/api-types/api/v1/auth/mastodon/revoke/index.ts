export type Methods = {
  post: {
    reqBody: {
      domain?: string;
      mastodonToken?: string;
      liveToken?: string;
    };

    resBody: { success: boolean };
  };
};
