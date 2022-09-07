import { LiveStatus } from '@prisma/client';
import { Methods } from 'api-types/api/v1/streams/_liveId@number';
import { lives, streams } from '../../../models';
import { APIRoute, LiveState, UserState } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1Streams: APIRoute<
  'liveId',
  never,
  never,
  Response,
  UserState & LiveState
> = async ctx => {
  const push = await streams.get(ctx.state.live.streamId);

  ctx.body = {
    live: lives.getPublic(ctx.state.live),
    push: {
      status: push?.status || LiveStatus.Provisioning
    }
  };
};
