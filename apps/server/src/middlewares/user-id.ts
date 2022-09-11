import type { Middleware } from 'koa';
import { UserToken } from '../redis/user-token';

const userToken = new UserToken();

export const middlewareGetUserId: Middleware = async (ctx, next) => {
  const header = ctx.headers.authorization;
  if (!header || typeof header !== 'string') {
    return next();
  }

  const [type, token] = header.split(' ');
  if (type !== 'Bearer') {
    ctx.status = 401;
    ctx.body = {
      errorCode: 'invalid_authorization_type'
    };
    return;
  }

  const id = await userToken.get(token);
  if (!id) {
    ctx.status = 401;
    ctx.body = {
      errorCode: 'unauthorized'
    };
    return;
  }

  ctx.state.userId = id;

  await next();
};
