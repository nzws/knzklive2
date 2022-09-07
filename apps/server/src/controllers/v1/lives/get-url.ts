import { Methods } from 'api-types/api/v1/lives/_liveId@number/url';
import { jwtEdge } from '../../../services/jwt';
import { getStreamUrl } from '../../../utils/domain';
import { APIRoute, LiveState } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1LivesUrl: APIRoute<
  never,
  never,
  never,
  Response,
  LiveState
> = async ctx => {
  // todo: authentication in private live

  const live = ctx.state.live;
  if (!live.startedAt) {
    ctx.code = 404;
    ctx.body = {
      errorCode: 'live_not_found'
    };
    return;
  }

  const token = await jwtEdge.generateTokenAsStream(live.id);

  ctx.body = {
    wsFlv: getStreamUrl(live.id, token)
  };
};
