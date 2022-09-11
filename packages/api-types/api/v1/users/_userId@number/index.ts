import { UserPublic } from 'server/src/models/user';
import { AuthorizationHeader } from '../../../../common/types';

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    resBody: UserPublic;
  };
};
