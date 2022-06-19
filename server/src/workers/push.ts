import { Job } from 'bullmq';

export default async function push(job: Job) {
  await Promise.resolve();

  return {
    type: 'push',
    name: job.name,
    data: job.data as unknown
  };
}
