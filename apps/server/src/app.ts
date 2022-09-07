import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import cors from '@koa/cors';
import { router } from './router';
import { Streaming } from './streaming';

export const app = async (): Promise<void> => {
  await Promise.resolve();

  const app = new Koa();
  app.use(bodyParser());
  app.use(logger());
  app.use(cors());

  const route = router();
  app.use(route.routes()).use(route.allowedMethods());

  // const board = new Router();
  // createBoard(board);
  // app.use(board.routes()).use(board.allowedMethods());

  const port = process.env.PORT || 8080;

  const server = app.listen(port);
  console.log(`Listening on port ${port}`);

  new Streaming(server);
};
