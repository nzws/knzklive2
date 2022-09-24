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
    live: lives.getPrivate(ctx.state.live)
  };
};
