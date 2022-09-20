import { AuthorizationHeader, TenantPublic } from '../../../common/types';

export type Methods = {
  get: {
    reqHeaders: AuthorizationHeader;

    resBody: TenantPublic[];
  };
};
