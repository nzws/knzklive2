import { UserPrivate } from 'server/src/models/user';
import { APIError, AuthorizationHeader } from '../../../../common/types';

export type Methods = {
  get: {
    reqHeaders: AuthorizationHeader;
    resBody: UserPrivate | APIError;
  };
};
