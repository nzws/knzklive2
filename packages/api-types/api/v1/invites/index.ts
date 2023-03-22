import { AuthorizationHeader, InvitePublic } from '../../../common/types';

export type Methods = {
  get: {
    reqHeaders: AuthorizationHeader;

    resBody: InvitePublic[];
  };

  post: {
    reqHeaders: AuthorizationHeader;

    resBody: {
      invite: InvitePublic;
    };
  };
};
