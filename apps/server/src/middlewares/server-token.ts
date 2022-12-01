import { APIRoute } from '../utils/types';

export const middlewareAuthorizeServer: APIRoute<
  never,
  never,
  {
    serverToken?: string;
  }
> = async (ctx, next) => {
  const token = ctx.request.body?.serverToken as string;

  if (token !== process.env.SERVER_TOKEN) {
    ctx.status = 403;
    ctx.body = {
      errorCode: 'forbidden'
    };
    return;
  }

  await next();
};
