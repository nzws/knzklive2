import { Methods } from 'api-types/api/v1/lives/explore';
import { lives } from '../../../models';
import { APIRoute } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1LivesExplore: APIRoute<
  never,
  never,
  never,
  Response
> = async ctx => {
  const currentLives = await lives.getPublicAndAlive();

  ctx.body = currentLives.map(lives.getPublic);
};
