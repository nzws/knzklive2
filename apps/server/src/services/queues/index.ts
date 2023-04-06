import { cronQueue } from './cron';
import { webhookQueue } from './webhook';

export const queues = [webhookQueue, cronQueue];
