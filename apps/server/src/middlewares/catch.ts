import { Middleware } from 'koa';

export const middlewareCatch: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(err);

    ctx.status = 500;
    ctx.body = {
      errorCode: 'internal_server_error'
    };
  }
};
