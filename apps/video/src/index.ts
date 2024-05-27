import Router from '@koa/router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import { middlewareAuthorizeServer } from './middleware/server-token';
import { apiExternalRecordingPublish } from './controllers/externals/recording/publish';
import { apiExternalRecordingUnPublish } from './controllers/externals/recording/unpublish';
import * as Sentry from '@sentry/node';
import { Action } from './services/action';

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

route.post(
  '/api/externals/v1/recording/publish',
  middlewareAuthorizeServer,
  apiExternalRecordingPublish
);
route.post(
  '/api/externals/v1/recording/unpublish',
  middlewareAuthorizeServer,
  apiExternalRecordingUnPublish
);

app.use(route.routes()).use(route.allowedMethods());

const port = process.env.PORT || 8000;

const server = app.listen(port);
console.log(`Listening on port ${port}`);

process.on('SIGTERM', () => {
  server.close();
  process.exit(0);
});

void Action.checkQuota();
