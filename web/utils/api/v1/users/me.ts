import type { Response } from '@server/controllers/v1/users/me';
import { NoParamsWithToken, RequestWithToken } from '../types';

export type { Response };

export const path = '/v1/users/me';

export const getV1UsersMe = ([
  token
]: NoParamsWithToken): RequestWithToken<Response> =>
  token ? { path, token } : undefined;
