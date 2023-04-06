export type RemovingLive = {
  liveId: number;
  watchToken: string;
};

export type Methods = {
  post: {
    reqBody: {
      serverToken: string;
      exceededSize: string;
    };

    resBody: {
      outdatedLives: RemovingLive[];
    };
  };
};
