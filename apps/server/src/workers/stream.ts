import { Job } from 'bullmq';
import { BaseWorker } from './_base';

export class StreamWorker extends BaseWorker {
  constructor() {
    super('stream');
  }

  async handle(job: Job) {
    console.log(job);
    await Promise.reject();
  }
}
