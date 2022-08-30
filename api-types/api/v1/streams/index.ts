export enum Privacy {
  Public = 'public',
  Private = 'private'
}

export type LiveSetting = {
  title?: string;
  description?: string;
  privacy?: Privacy;
  sensitive?: boolean;
  hashtag?: string;
};

export type Live = unknown;

export type Methods = {
  post: {
    reqBody: LiveSetting;

    resBody: Live;
  };

  patch: {
    reqBody: LiveSetting;

    resBody: Live;
  };
};
