import type { Middleware } from 'koa';
import { users } from '../models';

export const middlewareAuthorizeUser: Middleware = async (ctx, next) => {
  const userId = ctx.state.userId as number | undefined;

  const user = await users.get(userId);
  if (!user) {
    ctx.status = 401;
    ctx.body = {
      errorCode: 'unauthorized'
    };
    return;
  }

  ctx.state.user = user;

  await next();
};
