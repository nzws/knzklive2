import { Methods } from 'api-types/api/v1/lives/_liveId@number/url';
import { streams } from '../../../models';
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
  const stream = await streams.get(live.streamId);
  if (!stream) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'live_not_found',
      message: 'Stream が存在しません'
    };
    return;
  }

  const isAccessible = streams.isAccessibleStreamByUser(
    live,
    stream,
    ctx.state.userId
  );
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
