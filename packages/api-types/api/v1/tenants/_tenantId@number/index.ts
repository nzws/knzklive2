import {
  AuthorizationHeader,
  TenantConfig,
  TenantPublic
} from '../../../../common/types';

export type Methods = {
  patch: {
    reqHeaders: AuthorizationHeader;

    reqBody: {
      displayName?: string;
      slug?: string;
      config: TenantConfig;
    };

    resBody: {
      success: boolean;
    };
  };

  get: {
    reqHeaders: AuthorizationHeader;

    resBody: {
      tenant: TenantPublic;
      config: TenantConfig;
    };
  };
};
