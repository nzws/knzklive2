import { Methods } from 'api-types/api/v1/lives/_liveId@number/count';
import { LiveWatching } from '../../../services/redis/live-watching';
import { getIP } from '../../../utils/ip';
import { APIRoute, LiveState } from '../../../utils/types';

type Response = Methods['get']['resBody'];

const liveWatching = new LiveWatching();

export const getV1LivesCount: APIRoute<
  never,
  never,
  never,
  Response,
  LiveState
> = async ctx => {
  const live = ctx.state.live;
  if (live.endedAt) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'live_already_ended'
    };
  }

  const ip = getIP(ctx);
  await liveWatching.signal(live.id, ip);

  const { current, sum } = await liveWatching.get(live.id);

  ctx.body = {
    current,
    sum
  };
};
