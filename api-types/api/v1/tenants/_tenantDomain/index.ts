import { TenantPublic } from '@server/models/tenant';

export type Methods = {
  get: {
    query?: {
      limit: number;
    };

    resBody: TenantPublic[];
  };
};
