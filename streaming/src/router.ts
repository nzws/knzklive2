import Router from '@koa/router';

export const router = (): Router => {
  const route = new Router();

  route.get('/health', ctx => {
    ctx.body = 'OK';
  });

  return route;
};
