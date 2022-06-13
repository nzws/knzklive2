import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import { router } from './router';

export const app = (): void => {
  const app = new Koa();
  app.use(bodyParser());
  app.use(logger());

  const route = router();
  app.use(route.routes()).use(route.allowedMethods());

  const port = process.env.PORT || 8080;

  app.listen(port);
  console.log(`Listening on port ${port}`);
};
