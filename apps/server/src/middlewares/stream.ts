import { Middleware } from 'koa';
import { LiveState, UserState } from '../utils/types';

export const middlewareMyStream: Middleware<UserState & LiveState> = async (
  ctx,
  next
) => {
  const { user, live } = ctx.state;
  if (!user || !live) {
    ctx.status = 500;
    ctx.body = { errorCode: 'internal_server_error' };
    return;
  }

  if (user.id !== live.userId) {
    ctx.status = 403;
    ctx.body = { errorCode: 'forbidden' };
    return;
  }

  await next();
};
