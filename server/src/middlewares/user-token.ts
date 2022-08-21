import type { Middleware } from 'koa';
import { UserToken } from '../services/token/user-token';

const userToken = new UserToken();

export const middlewareAuthorizeUser: Middleware = async (ctx, next) => {
  const token = ctx.headers.authorization;
  if (!token || typeof token !== 'string') {
    ctx.code = 401;
    ctx.body = {
      errorCode: 'unauthorized'
    };
    ctx.throw(401);
    return;
  }

  const [type, jwt] = token.split(' ');
  if (type !== 'Bearer') {
    ctx.code = 401;
    ctx.body = {
      errorCode: 'invalid_authorization_type'
    };
    return;
  }

  const payload = await userToken.verifyToken(jwt || '');
  if (!payload) {
    ctx.code = 401;
    ctx.body = {
      errorCode: 'unauthorized'
    };
    return;
  }

  ctx.state.user = payload;

  await next();
};
