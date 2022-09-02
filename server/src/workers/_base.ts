import { Job, Queue, Worker } from 'bullmq';
import { redis } from '../redis/_client';

export abstract class BaseWorker {
  readonly queue: Queue;
  readonly worker: Worker;

  constructor(id: string) {
    this.queue = new Queue(id, {
      connection: redis
    });

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
