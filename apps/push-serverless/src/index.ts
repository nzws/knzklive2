import Router from '@koa/router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import { apiExternalAction } from './controllers/externals/action';
import { apiExternalThumbnail } from './controllers/externals/thumbnail';
import { apiInternalOnPlay } from './controllers/internal/on_play';
import { apiInternalOnPublish } from './controllers/internal/on_publish';
import { apiInternalOnUnPublish } from './controllers/internal/on_unpublish';
import { Streaming } from './streaming';
import * as Sentry from '@sentry/node';
import { isServerIdling } from './utils/sessions';

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

const app = new Koa();
app.use(bodyParser());
app.use(logger());

Sentry.setupKoaErrorHandler(app);

const route = new Router();

route.post('/api/v1/on_publish', apiInternalOnPublish);
route.post('/api/v1/on_unpublish', apiInternalOnUnPublish);
route.post('/api/v1/on_play', apiInternalOnPlay);

route.post('/api/externals/v1/action', apiExternalAction);
route.post('/api/externals/v1/thumbnail', apiExternalThumbnail);

app.use(route.routes()).use(route.allowedMethods());

const port = process.env.PORT || 8000;

const server = app.listen(port);
console.log(`Listening on port ${port}`);

const autoSleep = setInterval(() => {
  if (isServerIdling() && !process.env.DISABLE_AUTO_SLEEP) {
    console.log('all lives ended, stopping server');
    clearInterval(autoSleep);
    server.close();
    process.exit(0);
  }
}, 1000 * 30);

process.on('SIGTERM', () => {
  clearInterval(autoSleep);
  server.close();
  process.exit(0);
});

new Streaming(server);
