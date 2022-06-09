import { UserPublic } from 'server/src/models/user';

export type Methods = {
  get: {
    resBody: UserPublic;
  };
};
