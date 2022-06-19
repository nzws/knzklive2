import type { Params } from '@server/controllers/v1/auth/mastodon/login';
import { getLink, withQuery } from 'utils/contexts/api';

export type { Params };

export const path = '/v1/auth/mastodon/login';

export const linkV1AuthMastodonLogin = (query: Params) =>
  getLink(withQuery(path, query));
