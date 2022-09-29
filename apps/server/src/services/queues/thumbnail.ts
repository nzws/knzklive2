import { Live } from '@prisma/client';
import BeeQueue from 'bee-queue';
import { images } from '../../models';
import {
  basePushStream,
  REDIS_CONNECTION,
  serverToken
} from '../../utils/constants';
import { pushApi } from '../push-api';
import { thumbnailStorage } from '../storage/thumbnail';

export const thumbnailQueue = new BeeQueue<{ live: Live }>('thumbnail', {
  redis: REDIS_CONNECTION,
  removeOnSuccess: true,
  activateDelayedJobs: true,
  removeOnFailure: true
});

thumbnailQueue.process(async job => {
  const { live } = job.data;
  console.log('thumbnail job', live.id);

  const { key, url } = await thumbnailStorage.getUploadUrlFromPushServer(
    live.tenantId,
    live.id
  );

  await pushApi(basePushStream).api.externals.v1.thumbnail.$post({
    body: {
      liveId: live.id,
      serverToken,
      signedUploadUrl: url
    }
  });

  await images.createForGeneratedLiveThumbnail(live, key);

  return true;
});

thumbnailQueue.on('job succeeded', (jobId, result) => {
  console.log(`Job ${jobId} succeeded with result`, result);
});

thumbnailQueue.on('job retrying', (jobId, err) => {
  console.log(
    `Job ${jobId} failed with error ${err.message} but is being retried!`
  );
});

thumbnailQueue.on('job failed', (jobId, err) => {
  console.log(`Job ${jobId} failed with error ${err.message}`);
});
