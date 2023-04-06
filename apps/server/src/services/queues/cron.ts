import { Queue, Worker } from 'bullmq';
import { queueRedis } from '../redis/_client';
import { VideoWatchingLogCache } from '../redis/video-watching-log-cache';
import { liveRecordings } from '../../models';

export type Event = 'daily_video_watching_log';

const name = 'cron';

export const cronQueue = new Queue<undefined, void, Event>(name, {
  connection: queueRedis,
  defaultJobOptions: {
    removeOnComplete: 20,
    removeOnFail: 20
  }
});

const dailyVideoWatchingLog = async () => {
  const ids = await VideoWatchingLogCache.getAllActiveLiveIds();
  await Promise.all(
    ids.map(async id => {
      const cache = new VideoWatchingLogCache(id);
      const count = await cache.getActiveCount(true);

      await liveRecordings.incrementCount(id, count);
      await cache.cleanupAll();
    })
  );

  console.log('dailyVideoWatchingLog', ids);
};

const worker = new Worker<undefined, void, Event>(
  name,
  async job => {
    const name = job.name;

    if (name === 'daily_video_watching_log') {
      await dailyVideoWatchingLog();
    }
  },
  { connection: queueRedis }
);

worker.on('error', err => {
  console.error('worker error', err);
});

export const initializeCronQueue = async () => {
  await cronQueue.add('daily_video_watching_log', undefined, {
    repeat: {
      pattern: '10 0 * * *'
    }
  });
};
