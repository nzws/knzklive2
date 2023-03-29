// https://github.com/misskey-dev/misskey.js/blob/13a2d16eab8637b6250396548619cd2cdf80a3c3/src/api.types.ts#L472-L489

export enum MisskeyNoteVisibility {
  Public = 'public',
  Home = 'home',
  Followers = 'followers',
  Specified = 'specified'
}

export type Methods = {
  post: {
    reqBody: {
      visibility?: MisskeyNoteVisibility;
      visibleUserIds?: string[];
      text: string;
      i: string;
    };
    resBody: {
      createdNote: {
        id: string;
        createdAt: string;
        text: string;
      };
    };
  };
};
