import { Job } from 'bullmq';
import { BaseWorker } from './_base';

export class StreamWorker extends BaseWorker {
  async handle(job: Job) {
    //
  }
}
