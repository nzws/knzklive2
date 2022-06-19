import { Worker, Queue } from 'bullmq';
import { REDIS_CONNECTION } from 'utils/constants';
import push from 'workers/push';

const name = 'push';

export const pushWorker = new Worker(name, push, {
  connection: REDIS_CONNECTION
});

export const pushQueue = new Queue(name, { connection: REDIS_CONNECTION });
