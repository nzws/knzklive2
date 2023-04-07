import * as Sentry from '@sentry/node';
import { CaptureConsole } from '@sentry/integrations';

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    integrations: [
      new CaptureConsole({
        levels: ['error', 'warn']
      })
    ],
    tracesSampleRate: 1.0
  });
}

import { app } from './app';

void app();
