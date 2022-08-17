import type {
  Params,
  Response
} from '@server/controllers/v1/auth/mastodon/refresh';
import { ParamsAsAnonymous, RequestAsAnonymous } from '~/utils/api/v1/types';

export type { Params, Response };

export const path = '/v1/auth/mastodon/refresh';

export const postV1AuthMastodonRefresh = ([
  body
]: ParamsAsAnonymous<Params>): RequestAsAnonymous<Response> => ({
  path,
  body
});
