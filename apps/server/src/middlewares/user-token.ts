import type { Middleware } from 'koa';
import { users } from '../models';
import { UserToken } from '../redis/user-token';

const userToken = new UserToken();

export const middlewareAuthorizeUser: Middleware = async (ctx, next) => {
  const header = ctx.headers.authorization;
  if (!header || typeof header !== 'string') {
    ctx.code = 401;
    ctx.body = {
      errorCode: 'unauthorized'
    };
    ctx.throw(401);
    return;
  }

  const [type, token] = header.split(' ');
  if (type !== 'Bearer') {
    ctx.code = 401;
    ctx.body = {
      errorCode: 'invalid_authorization_type'
    };
    return;
  }

  const id = await userToken.get(token);
  if (!id) {
    ctx.code = 401;
    ctx.body = {
      errorCode: 'unauthorized'
    };
    return;
  }

  const user = await users.get(id);
  if (!user) {
    ctx.code = 401;
    ctx.body = {
      errorCode: 'user_not_found'
    };
    return;
  }

  ctx.state.user = user;

  await next();
};
