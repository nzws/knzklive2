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
import { middlewareMyStream } from './middlewares/stream';
import { getV1InternalsEdgeJwt } from './controllers/v1/internals/edge/jwt';
import { getV1LivesUrl } from './controllers/v1/lives/get-url';
import { getV1StreamsUrl } from './controllers/v1/streams/get-url';
import { postV1LivesComment } from './controllers/v1/lives/post-comment';
import { getV1Streams } from './controllers/v1/streams/get';
import { postV1Streams } from './controllers/v1/streams/create';
import { patchV1Streams } from './controllers/v1/streams/patch';
import { postV1StreamsAction } from './controllers/v1/streams/action';

export const router = (): Router => {
  const route = new Router();

  route.get('/', ctx => {
    ctx.redirect('https://www.youtube.com/watch?v=8C7s7BiRxdA');
  });

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
    '/v1/lives/find/:tenantId/:liveIdInTenant',
    middlewareTenant,
    getV1Lives
  );
  route.get('/v1/lives/explore', getV1LivesExplore);
  route.get('/v1/lives/:liveId/url', middlewareLive, getV1LivesUrl);
  route.post(
    '/v1/lives/:liveId/comment',
    middlewareAuthorizeUser,
    middlewareLive,
    postV1LivesComment
  );

  route.post('/v1/streams', middlewareAuthorizeUser, postV1Streams);
  route.get(
    '/v1/streams/:liveId',
    middlewareAuthorizeUser,
    middlewareLive,
    middlewareMyStream,
    getV1Streams
  );
  route.patch(
    '/v1/streams/:liveId',
    middlewareAuthorizeUser,
    middlewareLive,
    middlewareMyStream,
    patchV1Streams
  );
  route.get(
    '/v1/streams/:liveId/url',
    middlewareAuthorizeUser,
    middlewareLive,
    middlewareMyStream,
    getV1StreamsUrl
  );
  route.post(
    '/v1/streams/:liveId/action',
    middlewareAuthorizeUser,
    middlewareLive,
    middlewareMyStream,
    postV1StreamsAction
  );

  route.get('/v1/internals/edge/jwt', getV1InternalsEdgeJwt);

  return route;
};
