import type {
  Params,
  Response
} from '@server/controllers/v1/auth/mastodon/token';
import { ParamsAsAnonymous, RequestAsAnonymous } from 'utils/api/v1/types';

export type { Params, Response };

export const path = '/v1/auth/mastodon/token';

export const getV1AuthMastodonToken = ([
  query
]: ParamsAsAnonymous<Params>): RequestAsAnonymous<Response> => ({
  path,
  query
});
