import Router from '@koa/router';
import Multer from '@koa/multer';
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
import { getV1Lives } from './controllers/v1/lives/get';
import { middlewareMyTenant } from './middlewares/my-tenant';
import { postV1InternalsPushCheckToken } from './controllers/v1/internals/push/check-token';
import { getV1LivesCount } from './controllers/v1/lives/get-count';
import { getV1TenantsMeOnce } from './controllers/v1/tenants/get-me-once';
import { patchV1Tenants } from './controllers/v1/tenants/patch';
import { middlewareAuthorizeServer } from './middlewares/server-token';
import { postV1InternalsPushAction } from './controllers/v1/internals/push/action';
import { getV1StreamsCommentViewerUrl } from './controllers/v1/streams/get-comment-viewer-url';
import { postV1StreamsThumbnail } from './controllers/v1/streams/post-thumbnail';
import { getV1InternalsWebInternalJwt } from './controllers/v1/internals/web-internal/jwt';
import { getV1TenantsLives } from './controllers/v1/tenants/get-lives';
import { v1AuthMisskeyLogin } from './controllers/v1/auth/misskey/login';
import { v1AuthMisskeyCallback } from './controllers/v1/auth/misskey/callback';
import { v1AuthMisskeyToken } from './controllers/v1/auth/misskey/token';
import { v1AuthMisskeyRefresh } from './controllers/v1/auth/misskey/refresh';
import { v1AuthMisskeyRevoke } from './controllers/v1/auth/misskey/revoke';
import { getV1InvitesGetList } from './controllers/v1/invites/get-list';
import { postV1Invites } from './controllers/v1/invites/create';
import { postV1Tenants } from './controllers/v1/tenants/create';

const multer = Multer({
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  }
});

export const router = (): Router => {
  const route = new Router();

  route.get('/', ctx => {
    ctx.body = {
      message: 'https://www.youtube.com/watch?v=8C7s7BiRxdA'
    };
  });

  route.get('/v1/about', getV1About);

  route.get('/v1/auth/mastodon/login', v1AuthMastodonLogin);
  route.get('/v1/auth/mastodon/callback', v1AuthMastodonCallback);
  route.post('/v1/auth/mastodon/token', v1AuthMastodonToken);
  route.post('/v1/auth/mastodon/refresh', v1AuthMastodonRefresh);
  route.post('/v1/auth/mastodon/revoke', v1AuthMastodonRevoke);

  route.get('/v1/auth/misskey/login', v1AuthMisskeyLogin);
  route.get('/v1/auth/misskey/callback', v1AuthMisskeyCallback);
  route.post('/v1/auth/misskey/token', v1AuthMisskeyToken);
  route.post('/v1/auth/misskey/refresh', v1AuthMisskeyRefresh);
  route.post('/v1/auth/misskey/revoke', v1AuthMisskeyRevoke);

  route.get('/v1/tenants/find/:key', getV1TenantsOnce);
  route.get('/v1/tenants/find/:key/lives', getV1TenantsLives);
  route.get('/v1/tenants', middlewareAuthorizeUser, getV1TenantsMe);
  route.post('/v1/tenants', middlewareAuthorizeUser, postV1Tenants);
  route.patch(
    '/v1/tenants/:tenantId',
    middlewareAuthorizeUser,
    middlewareTenant,
    middlewareMyTenant,
    patchV1Tenants
  );
  route.get(
    '/v1/tenants/:tenantId',
    middlewareAuthorizeUser,
    middlewareTenant,
    middlewareMyTenant,
    getV1TenantsMeOnce
  );

  route.get('/v1/users/me', middlewareAuthorizeUser, getV1UsersMe);
  route.get('/v1/users/:userId', getV1UsersOnce);

  route.get('/v1/lives/find/:slug/:liveIdInTenant', getV1LivesFindById);
  route.get('/v1/lives/explore', getV1LivesExplore);
  route.get('/v1/lives/:liveId', middlewareLive, getV1Lives);
  route.get('/v1/lives/:liveId/url', middlewareLive, getV1LivesUrl);
  route.get('/v1/lives/:liveId/count', middlewareLive, getV1LivesCount);
  route.get('/v1/lives/:liveId/comments', getV1LivesComment);
  route.post(
    '/v1/lives/:liveId/comments',
    middlewareAuthorizeUser,
    middlewareLive,
    postV1LivesComment
  );
  route.delete(
    '/v1/lives/:liveId/comments',
    middlewareAuthorizeUser,
    middlewareLive,
    deleteV1LivesComment
  );

  route.post('/v1/streams', middlewareAuthorizeUser, postV1Streams);
  route.post(
    '/v1/streams/thumbnail',
    middlewareAuthorizeUser,
    multer.single('file'),
    postV1StreamsThumbnail
  );
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
  route.get(
    '/v1/streams/:liveId/comment-viewer-url',
    middlewareAuthorizeUser,
    middlewareLive,
    middlewareMyStream,
    getV1StreamsCommentViewerUrl
  );
  route.post(
    '/v1/streams/:liveId/action',
    middlewareAuthorizeUser,
    middlewareLive,
    middlewareMyStream,
    postV1StreamsAction
  );

  route.get('/v1/invites', middlewareAuthorizeUser, getV1InvitesGetList);
  route.post('/v1/invites', middlewareAuthorizeUser, postV1Invites);

  route.get('/v1/internals/edge/jwt', getV1InternalsEdgeJwt);
  route.get('/v1/internals/web-internal/jwt', getV1InternalsWebInternalJwt);
  route.post(
    '/v1/internals/push/check-token',
    middlewareAuthorizeServer,
    postV1InternalsPushCheckToken
  );
  route.post(
    '/v1/internals/push/action',
    middlewareAuthorizeServer,
    postV1InternalsPushAction
  );

  return route;
};
