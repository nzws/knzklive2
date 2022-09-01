import { Methods } from 'api-types/api/v1/lives/explore';
import { lives } from '../../../models';
import { APIRouteWithAuth } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1LivesExplore: APIRouteWithAuth<
  never,
  never,
  never,
  Response
> = async ctx => {
  const currentLives = await lives.getPublicAndAlive();

  ctx.body = currentLives.map(lives.getPublic);
};
