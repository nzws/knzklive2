import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import cors from '@koa/cors';
import { KoaAdapter } from '@bull-board/koa';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { router } from './router';
import { pushQueue, watchQueue, watchQueueScheduler } from './queues';

export const app = async (): Promise<void> => {
  await watchQueueScheduler.waitUntilReady();

  const app = new Koa();
  app.use(bodyParser());
  app.use(logger());
  app.use(cors());

  const serverAdapter = new KoaAdapter();

  createBullBoard({
    queues: [new BullMQAdapter(pushQueue), new BullMQAdapter(watchQueue)],
    serverAdapter
  });

  serverAdapter.setBasePath('/admin/queue');
  app.use(serverAdapter.registerPlugin());

  const route = router();
  app.use(route.routes()).use(route.allowedMethods());

  const port = process.env.PORT || 8080;

  app.listen(port);
  console.log(`Listening on port ${port}`);
};
