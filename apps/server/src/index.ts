import * as Sentry from '@sentry/node';

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    integrations: [
      Sentry.captureConsoleIntegration({
        levels: ['error', 'warn']
      })
    ],
    tracesSampleRate: 1.0
  });
}

import { app } from './app';

void app();
