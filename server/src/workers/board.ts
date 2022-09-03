import Router from '@koa/router';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { KoaAdapter } from '@bull-board/koa';
import { workers } from '.';

export const createBoard = (app: Router) => {
  const serverAdapter = new KoaAdapter();

  createBullBoard({
    queues: workers.map(worker => new BullMQAdapter(worker.queue)),
    serverAdapter
  });

  serverAdapter.setBasePath('/queues');
  app.use(serverAdapter.registerPlugin());
  // todo: admin authentication
};
