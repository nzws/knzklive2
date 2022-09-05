export type Methods = {
  post: {
    reqBody: {
      domain: string;
      token: string;
    };

    resBody: { success: boolean };
  };
};
