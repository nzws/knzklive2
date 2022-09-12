import { Methods } from 'api-types/api/v1/lives/_liveId@number/url';
import { lives } from '../../../models';
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
  const live = ctx.state.live;

  const isAccessible = lives.isAccessibleStreamByUser(live, ctx.state.userId);
  if (!isAccessible) {
    ctx.status = 403;
    ctx.body = {
      errorCode: 'forbidden_live'
    };
    return;
  }

  const token = await jwtEdge.generateTokenAsStream(live.id);

  ctx.body = {
    wsFlv: getStreamUrl(live.id, token)
  };
};
