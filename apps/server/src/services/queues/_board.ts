import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { KoaAdapter } from '@bull-board/koa';
import { queues } from '.';

export const createBoard = (path: string) => {
  const serverAdapter = new KoaAdapter();

  createBullBoard({
    queues: queues.map(q => new BullMQAdapter(q)),
    serverAdapter
  });

  serverAdapter.setBasePath(path);

  return serverAdapter;
};
