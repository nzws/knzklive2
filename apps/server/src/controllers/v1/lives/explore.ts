import { Methods } from 'api-types/api/v1/lives/explore';
import { lives } from '../../../models';
import { LiveWatching } from '../../../services/redis/live-watching';
import { APIRoute } from '../../../utils/types';

type Response = Methods['get']['resBody'];

const liveWatching = new LiveWatching();

export const getV1LivesExplore: APIRoute<
  never,
  never,
  never,
  Response
> = async ctx => {
  const currentLives = await lives.getPublicAndAlive();

  const counts = await Promise.all(
    currentLives.map(live => liveWatching.get(live.id))
  );

  ctx.body = currentLives.map((live, index) => ({
    ...lives.getPublic(live),
    watchingCurrentCount: counts[index].current
  }));
};
