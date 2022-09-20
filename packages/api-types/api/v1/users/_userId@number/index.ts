import { AuthorizationHeader, UserPublic } from '../../../../common/types';

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    resBody: UserPublic;
  };
};
