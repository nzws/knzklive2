import type { Response } from '@server/controllers/v1/tenants/get-once';
import { ParamsAsAnonymous, RequestWithToken } from '../types';

export type { Response };

export const path = '/v1/tenants/';

export const getV1TenantsOnce = ([key]: ParamsAsAnonymous<
  string | undefined
>): RequestWithToken<Response> =>
  key
    ? {
        path: path + key
      }
    : undefined;
