import { Job } from 'bullmq';

export default async function watch(job: Job) {
  await Promise.resolve();

  return {
    type: 'watch',
    name: job.name,
    data: job.data as unknown
  };
}
