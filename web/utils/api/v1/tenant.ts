import type { Params, Response } from '@server/controllers/v1/tenant';
import { fetcher, withQuery } from 'utils/fetcher';

export type { Params, Response };

export const path = '/v1/tenant';

export const getV1Tenant = async (query: Params): Promise<Response> =>
  fetcher<Response>(withQuery(path, query));
