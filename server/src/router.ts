import Router from '@koa/router';
import { getV1TenantsOnce } from './controllers/v1/tenants/get-once';
import { getV1UsersMe } from './controllers/v1/users/me';
import { middlewareAuthorizeUser } from './middlewares/user-token';
import { v1AuthMastodonCallback } from './controllers/v1/auth/mastodon/callback';
import { v1AuthMastodonLogin } from './controllers/v1/auth/mastodon/login';
import { v1AuthMastodonToken } from './controllers/v1/auth/mastodon/token';
import { v1AuthMastodonRefresh } from './controllers/v1/auth/mastodon/refresh';
import { v1AuthMastodonRevoke } from './controllers/v1/auth/mastodon/revoke';
import { middlewareLive } from './middlewares/live';
import { middlewareTenant } from './middlewares/tenant';
import { getV1LivesExplore } from './controllers/v1/lives/explore';
import { getV1UsersOnce } from './controllers/v1/users/get';
import { getV1Lives } from './controllers/v1/lives/get';
import { postV1Comment } from './controllers/v1/comments/post';
import { middlewareMyStream } from './middlewares/stream';

export const router = (): Router => {
  const route = new Router();

  route.get('/v1/auth/mastodon/login', v1AuthMastodonLogin);
  route.get('/v1/auth/mastodon/callback', v1AuthMastodonCallback);
  route.post('/v1/auth/mastodon/token', v1AuthMastodonToken);
  route.post('/v1/auth/mastodon/refresh', v1AuthMastodonRefresh);
  route.post('/v1/auth/mastodon/revoke', v1AuthMastodonRevoke);

  route.get('/v1/tenants/:key', getV1TenantsOnce);
  // route.post('/v1/tenants', middlewareAuthorizeUser);
  // route.patch('/v1/tenants/:id', middlewareAuthorizeUser);

  route.get('/v1/users/me', middlewareAuthorizeUser, getV1UsersMe);
  route.get('/v1/users/:userId', getV1UsersOnce);

  route.get(
    '/v1/lives/:tenantId/:liveIdInTenant',
    middlewareTenant,
    getV1Lives
  );
  route.get('/v1/lives/explore', getV1LivesExplore);

  // route.get('/v1/comments/:liveId', middlewareAuthorizeUser, middlewareLive);
  route.post(
    '/v1/comments/:liveId',
    middlewareAuthorizeUser,
    middlewareLive,
    postV1Comment
  );

  route.post('/v1/streams', middlewareAuthorizeUser);
  route.get(
    '/v1/streams/:liveId',
    middlewareAuthorizeUser,
    middlewareLive,
    middlewareMyStream
  );
  route.patch(
    '/v1/streams/:liveId',
    middlewareAuthorizeUser,
    middlewareLive,
    middlewareMyStream
  );
  route.post(
    '/v1/streams/:liveId/action',
    middlewareAuthorizeUser,
    middlewareLive,
    middlewareMyStream
  );

  return route;
};
