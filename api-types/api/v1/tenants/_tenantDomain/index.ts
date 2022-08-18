import { TenantPublic } from '@server/models/tenant';

export type Methods = {
  get: {
    resBody: TenantPublic;
  };
};
