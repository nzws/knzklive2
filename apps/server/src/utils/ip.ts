import { Context } from 'koa';

export const getIP = (ctx: Context) =>
  (ctx.req.headers['cf-connecting-ip'] ||
    ctx.req.headers['X-Forwarded-For'] ||
    ctx.ip) as string;
