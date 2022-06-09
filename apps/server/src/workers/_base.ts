import { Job, Queue, QueueScheduler, Worker } from 'bullmq';
import { redis } from '../redis/_client';

export abstract class BaseWorker {
  readonly queue: Queue;
  readonly worker: Worker;
  readonly scheduler?: QueueScheduler;

  constructor(id: string, enableScheduler = false) {
    this.queue = new Queue(id, {
      connection: redis
    });

    if (enableScheduler) {
      this.scheduler = new QueueScheduler(id, {
        connection: redis
      });
    }

    this.worker = new Worker(
      id,
      async job => {
        await this.handle(job);
      },
      {
        connection: redis
      }
    );
  }

  abstract handle(job: Job): Promise<void>;
}
