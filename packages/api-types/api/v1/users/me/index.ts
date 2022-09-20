import { AuthorizationHeader, UserPrivate } from '../../../../common/types';

export type Methods = {
  get: {
    reqHeaders: AuthorizationHeader;
    resBody: UserPrivate;
  };
};
