import { Image, Live, Tenant } from '@prisma/client';
import BeeQueue from 'bee-queue';
import { lives, tenants } from '../../models';
import { REDIS_CONNECTION } from '../../utils/constants';

type WebhookType = 'live:started';

export const webhookQueue = new BeeQueue<{
  live: Live & {
    thumbnail: Image | null;
    tenant: Tenant;
  };
  type: WebhookType;
}>('webhook', {
  redis: REDIS_CONNECTION,
  removeOnSuccess: true,
  activateDelayedJobs: true,
  removeOnFailure: true
});

webhookQueue.process(async job => {
  const { live, type } = job.data;
  console.log('webhook job', live.id);

  if (!live.startedAt) {
    throw new Error('Live not started');
  }
  if (live.privacy !== 'Public') {
    console.log('Live is not public');
    return;
  }

  const config = live.tenant && tenants.getConfig(live.tenant);
  if (!config?.webhookUrl) {
    console.log('webhook job', live.id, 'no webhook url');
    return;
  }

  const abort = new AbortController();

  const timeout = setTimeout(() => {
    abort.abort();
  }, 5000);

  try {
    await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type,
        live: lives.getPublic(live)
      }),
      signal: abort.signal
    });
  } finally {
    clearTimeout(timeout);
  }

  return true;
});

webhookQueue.on('job succeeded', (jobId, result) => {
  console.log(`Job ${jobId} succeeded with result`, result);
});

webhookQueue.on('job retrying', (jobId, err) => {
  console.log(
    `Job ${jobId} failed with error ${err.message} but is being retried!`
  );
});

webhookQueue.on('job failed', (jobId, err) => {
  console.log(`Job ${jobId} failed with error ${err.message}`);
});
