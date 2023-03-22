import {
  AuthorizationHeader,
  LivePrivate,
  TenantPublic
} from '../../../common/types';

export type Methods = {
  get: {
    reqHeaders: AuthorizationHeader;

    resBody: {
      tenant: TenantPublic;
      recentLive?: LivePrivate;
    }[];
  };

  post: {
    reqHeaders: AuthorizationHeader;

    reqBody: {
      inviteCode: string;
      slug: string;
    };

    resBody: {
      tenant: TenantPublic;
    };
  };
};
