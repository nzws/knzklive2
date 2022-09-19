import { TenantPublic } from 'server/src/models/tenant';
import { AuthorizationHeader } from '../../../../../common/types';

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    resBody: TenantPublic;
  };
};
