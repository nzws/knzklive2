import { Methods } from 'api-types/api/v1/streams/_liveId@number/comment-viewer-url';
import { tenants } from '../../../models';
import { jwtCommentViewer } from '../../../services/jwt';
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

  const token = await jwtCommentViewer.generateToken(live.id);
  const host = process.env.FRONTEND_ENDPOINT || '';

  ctx.body = {
    url: `${host}/embed/comment?liveId=${live.id}&viewerToken=${token}`
  };
};
