import { Methods } from 'api-types/api/v1/streams/_liveId@number/url';
import { jwtEdge } from '../../../services/jwt';
import {
  getPushStreamKey,
  getPushUrl,
  getPushWebsocketUrl
} from '../../../utils/constants';
import { APIRoute, LiveState } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1StreamsUrl: APIRoute<
  never,
  never,
  never,
  Response,
  LiveState
> = async ctx => {
  const live = ctx.state.live;
  const token = await jwtEdge.generateTokenAsPush(live.id);

  ctx.body = {
    rtmp: {
      url: getPushUrl(),
      streamKey: getPushStreamKey(live.id, token, live.watchToken || undefined)
    },
    websocket: {
      url: getPushWebsocketUrl(live.id, token, live.watchToken || undefined)
    }
  };
};
