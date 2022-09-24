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

const app = new Koa();
app.use(bodyParser());
app.use(logger());

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

new Streaming(server);

process.on('SIGTERM', () => {
  server.close();
  process.exit(0);
});
