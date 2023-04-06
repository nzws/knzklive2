export type Methods = {
  post: {
    reqBody: {
      status: 'playing' | 'paused' | 'ended';
      seek: number;
    };

    resBody: {
      success: boolean;
    };
  };
};
