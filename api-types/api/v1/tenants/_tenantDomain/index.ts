import { TenantPublic } from '@server/models/tenant';

type Tenant = TenantPublic;

export type Methods = {
  get: {
    query?: {
      limit: number;
    };

    resBody: Tenant[];
  };
};
