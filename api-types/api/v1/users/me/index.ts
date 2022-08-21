import { UserPrivate } from '@server/models/user';
import { AuthorizationHeader } from '@api-types/common/types';

export type Methods = {
  get: {
    reqHeaders: AuthorizationHeader;
    resBody: UserPrivate;
  };
};
