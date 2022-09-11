import type { Middleware } from 'koa';
import { users } from '../models';

export const middlewareAuthorizeUser: Middleware = async (ctx, next) => {
  const userId = ctx.state.userId as number;

  const user = await users.get(userId);
  if (!user) {
    ctx.status = 401;
    ctx.body = {
      errorCode: 'user_not_found'
    };
    return;
  }

  ctx.state.user = user;

  await next();
};
