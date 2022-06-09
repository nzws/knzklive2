import Router from '@koa/router';
import { getV1Tenant } from 'controllers/v1/tenant';
import { v1AuthMastodonCallback } from './controllers/v1/auth/mastodon/callback';
import { v1AuthMastodonLogin } from './controllers/v1/auth/mastodon/login';
import { v1AuthMastodonToken } from './controllers/v1/auth/mastodon/token';

export const router = (): Router => {
  const route = new Router();

  route.get('/v1/auth/mastodon/login', v1AuthMastodonLogin);
  route.get('/v1/auth/mastodon/callback', v1AuthMastodonCallback);
  route.get('/v1/auth/mastodon/token', v1AuthMastodonToken);

  route.get('/v1/tenant', getV1Tenant);

  return route;
};
