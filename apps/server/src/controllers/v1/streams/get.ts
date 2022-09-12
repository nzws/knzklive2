import { Methods } from 'api-types/api/v1/streams/_liveId@number';
import { lives } from '../../../models';
import { APIRoute, LiveState, UserState } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1Streams: APIRoute<
  'liveId',
  never,
  never,
  Response,
  UserState & LiveState
> = ctx => {
  ctx.body = {
    live: lives.getPublic(ctx.state.live),
    pushFirstStartedAt: ctx.state.live.pushFirstStartedAt || undefined,
    pushLastEndedAt: ctx.state.live.pushLastEndedAt || undefined,
    pushLastStartedAt: ctx.state.live.pushLastStartedAt || undefined
  };
};
