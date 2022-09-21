import { Methods } from 'api-types/api/v1/streams/_liveId@number/comment-viewer-url';
import { tenants } from '../../../models';
import { jwtCommentViewer } from '../../../services/jwt';
import { PROTOCOL } from '../../../utils/constants';
import { APIRoute, LiveState } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1StreamsCommentViewerUrl: APIRoute<
  never,
  never,
  never,
  Response,
  LiveState
> = async ctx => {
  const live = ctx.state.live;
  const tenant = await tenants.get(live.tenantId);
  if (!tenant) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'not_found'
    };
    return;
  }

  const tenantDomain = tenants.getPublic(tenant).domain;
  const token = await jwtCommentViewer.generateToken(live.id);

  ctx.body = {
    url: `${PROTOCOL}://${tenantDomain}/embed/comment?liveId=${live.id}&viewerToken=${token}`
  };
};
