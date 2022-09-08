import type { Middleware } from 'koa';
import { lives } from '../models';

export const middlewareLive: Middleware = async (ctx, next) => {
  const liveId = parseInt(
    (ctx.params as Record<string, string>).liveId || '',
    10
  );
  if (!liveId || isNaN(liveId) || liveId <= 0) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'live_not_found'
    };
    return;
  }

  const data = await lives.get(liveId);
  if (!data) {
    ctx.code = 404;
    ctx.body = {
      errorCode: 'live_not_found'
    };
    return;
  }

  ctx.state.live = data;

  await next();
};
