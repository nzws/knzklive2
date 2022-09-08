import { Middleware } from 'koa';

export const middlewareCatch: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const e = err as Record<string, unknown>;
    const code = e?.statusCode || e?.status || 500;

    if (code === 500) {
      console.error(err);

      ctx.status = 500;
      ctx.body = {
        errorCode: 'internal_server_error'
      };
    }
  }
};
