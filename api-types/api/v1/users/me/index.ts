import { UserPrivate } from '@server/models/user';

export type Methods = {
  get: {
    resBody: UserPrivate
  };
};
