import Router from '@koa/router';
import { getV1TenantsOnce } from './controllers/v1/tenants/get-once';
import { getV1UsersMe } from './controllers/v1/users/me';
import { middlewareAuthorizeUser } from './middlewares/user-auth';
import { v1AuthMastodonCallback } from './controllers/v1/auth/mastodon/callback';
import { v1AuthMastodonLogin } from './controllers/v1/auth/mastodon/login';
import { v1AuthMastodonToken } from './controllers/v1/auth/mastodon/token';
import { v1AuthMastodonRefresh } from './controllers/v1/auth/mastodon/refresh';
import { v1AuthMastodonRevoke } from './controllers/v1/auth/mastodon/revoke';
import { middlewareLive } from './middlewares/live';
import { middlewareTenant } from './middlewares/tenant';
import { getV1LivesExplore } from './controllers/v1/lives/explore';
import { getV1UsersOnce } from './controllers/v1/users/get';
import { getV1LivesFindById } from './controllers/v1/lives/find-by-id';
import { middlewareMyStream } from './middlewares/stream';
import { getV1InternalsEdgeJwt } from './controllers/v1/internals/edge/jwt';
import { getV1LivesUrl } from './controllers/v1/lives/get-url';
import { getV1StreamsUrl } from './controllers/v1/streams/get-url';
import { postV1LivesComment } from './controllers/v1/lives/post-comment';
import { getV1Streams } from './controllers/v1/streams/get';
import { postV1Streams } from './controllers/v1/streams/create';
import { patchV1Streams } from './controllers/v1/streams/patch';
import { postV1StreamsAction } from './controllers/v1/streams/action';
import { getV1LivesComment } from './controllers/v1/lives/get-comment';
import { deleteV1LivesComment } from './controllers/v1/lives/delete-comment';
import { getV1TenantsMe } from './controllers/v1/tenants/get-me';
import { getV1About } from './controllers/v1/about';
import { getV1LivesTop } from './controllers/v1/lives/get-top';
import { getV1Lives } from './controllers/v1/lives/get';
import { middlewareMyTenant } from './middlewares/my-tenant';
import { getV1TenantStreamStatus } from './controllers/v1/tenants/get-stream-status';
import { getV1InternalsPushCheckToken } from './controllers/v1/internals/push/check-token';

export const router = (): Router => {
  const route = new Router();

  route.get('/', ctx => {
    ctx.redirect('https://www.youtube.com/watch?v=8C7s7BiRxdA');
  });

  route.get('/v1/about', getV1About);

  route.get('/v1/auth/mastodon/login', v1AuthMastodonLogin);
  route.get('/v1/auth/mastodon/callback', v1AuthMastodonCallback);
  route.post('/v1/auth/mastodon/token', v1AuthMastodonToken);
  route.post('/v1/auth/mastodon/refresh', v1AuthMastodonRefresh);
  route.post('/v1/auth/mastodon/revoke', v1AuthMastodonRevoke);

  route.get('/v1/tenants/:key', getV1TenantsOnce);
  route.get('/v1/tenants', middlewareAuthorizeUser, getV1TenantsMe);
  // route.post('/v1/tenants', middlewareAuthorizeUser);
  // route.patch('/v1/tenants/:id', middlewareAuthorizeUser);
  route.get(
    '/v1/tenants/:tenantId/stream-status',
    middlewareAuthorizeUser,
    middlewareTenant,
    middlewareMyTenant,
    getV1TenantStreamStatus
  );

  route.get('/v1/users/me', middlewareAuthorizeUser, getV1UsersMe);
  route.get('/v1/users/:userId', getV1UsersOnce);

  route.get('/v1/lives/find/:tenantDomain/:liveIdInTenant', getV1LivesFindById);
  route.get('/v1/lives/find/:tenantId/top', middlewareTenant, getV1LivesTop);
  route.get('/v1/lives/explore', getV1LivesExplore);
  route.get('/v1/lives/:liveId', middlewareLive, getV1Lives);
  route.get('/v1/lives/:liveId/url', middlewareLive, getV1LivesUrl);
  route.get('/v1/lives/:liveId/comment', middlewareLive, getV1LivesComment);
  route.post(
    '/v1/lives/:liveId/comment',
    middlewareAuthorizeUser,
    middlewareLive,
    postV1LivesComment
  );
  route.delete(
    '/v1/lives/:liveId/comment',
    middlewareAuthorizeUser,
    middlewareLive,
    deleteV1LivesComment
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
  route.post('/v1/internals/push/check-token', getV1InternalsPushCheckToken);

  return route;
};
