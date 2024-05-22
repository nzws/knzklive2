import { Methods } from 'api-types/api/v1/streams/_liveId@number/url';
import {
  getPushStreamKey,
  getPushWebsocketUrl,
  pushDomain
} from '../../../utils/constants';
import { APIRoute, LiveState } from '../../../utils/types';
import { lives } from '../../../models';

type Response = Methods['get']['resBody'];

export const getV1StreamsUrl: APIRoute<
  never,
  never,
  never,
  Response,
  LiveState
> = async ctx => {
  const live = ctx.state.live;
  const token = live.pushToken ?? (await lives.regeneratePushToken(live));

  ctx.body = {
    rtmp: {
      unsecure_url: `rtmp://${pushDomain}/live`,
      secure_url: `rtmps://${pushDomain}:1936/live`,
      streamKey: getPushStreamKey(live.id, token, live.watchToken || undefined)
    },
    websocket: {
      url: getPushWebsocketUrl(live.id, token, live.watchToken || undefined)
    }
  };
};
