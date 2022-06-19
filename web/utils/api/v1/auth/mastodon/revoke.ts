import type {
  Params,
  Response
} from '@server/controllers/v1/auth/mastodon/revoke';
import { ParamsAsAnonymous, RequestAsAnonymous } from 'utils/api/v1/types';

export type { Params, Response };

export const path = '/v1/auth/mastodon/revoke';

export const postV1AuthMastodonRevoke = ([
  body
]: ParamsAsAnonymous<Params>): RequestAsAnonymous<Response> => ({
  path,
  body
});
