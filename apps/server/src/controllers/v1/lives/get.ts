import { Methods } from 'api-types/api/v1/lives/_liveId@number';
import { lives } from '../../../models';
import { APIRoute, LiveState } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1Lives: APIRoute<
  never,
  never,
  never,
  Response,
  LiveState
> = ctx => {
  ctx.body = lives.getPublic(ctx.state.live);
};
