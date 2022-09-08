import { TenantPublic } from 'server/src/models/tenant';
import { APIError } from '../../../../common/types';

export type Methods = {
  get: {
    resBody: TenantPublic | APIError;
  };
};
