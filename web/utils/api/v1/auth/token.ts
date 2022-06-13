import type {
  Params,
  Response
} from '@server/controllers/v1/auth/mastodon/token';
import { fetcher, withQuery } from 'utils/fetcher';

export type { Params, Response };

export const path = '/v1/auth/mastodon/token';

export const getV1AuthMastodonToken = async (
  query: Params
): Promise<Response> => fetcher<Response>(withQuery(path, query));
