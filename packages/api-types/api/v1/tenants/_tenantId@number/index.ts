import { TenantConfig, TenantPublic } from 'server/src/models/tenant';
import { AuthorizationHeader } from '../../../../common/types';

export type Methods = {
  patch: {
    reqHeaders: AuthorizationHeader;

    reqBody: {
      displayName?: string;
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
