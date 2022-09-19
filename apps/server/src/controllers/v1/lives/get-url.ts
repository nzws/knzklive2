import { Methods } from 'api-types/api/v1/lives/_liveId@number/url';
import { lives } from '../../../models';
import { jwtEdge } from '../../../services/jwt';
import { basePushStream } from '../../../utils/constants';
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
  if (!live.watchToken) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'live_not_found'
    };
    return;
  }

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
    flv: `${basePushStream}/streaming/live/${live.id}_${live.watchToken}.flv?token=${token}`,
    hls: `${basePushStream}/static/live/${live.id}_${live.watchToken}.m3u8?token=${token}`,
    aac: `${basePushStream}/streaming/live/${live.id}_${live.watchToken}.aac?token=${token}`
  };
};
