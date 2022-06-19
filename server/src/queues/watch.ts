import { Worker, Queue, QueueScheduler } from 'bullmq';
import { REDIS_CONNECTION } from 'utils/constants';
import watch from 'workers/watch';

const name = 'watch';

export const watchWorker = new Worker(name, watch, {
  connection: REDIS_CONNECTION
});

export const watchQueue = new Queue(name, { connection: REDIS_CONNECTION });

export const watchQueueScheduler = new QueueScheduler(name, {
  connection: REDIS_CONNECTION
});
