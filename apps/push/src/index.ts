import Router from '@koa/router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import { apiExternalAction } from './controllers/externals/action';
import { apiInternalOnPlay } from './controllers/internal/on_play';
import { apiInternalOnPublish } from './controllers/internal/on_publish';
import { apiInternalOnUnPublish } from './controllers/internal/on_unpublish';

const app = new Koa();
app.use(bodyParser());
app.use(logger());

const route = new Router();

route.post('/api/v1/on_publish', apiInternalOnPublish);
route.post('/api/v1/on_unpublish', apiInternalOnUnPublish);
route.post('/api/v1/on_play', apiInternalOnPlay);

route.post('/api/externals/v1/action', apiExternalAction);

app.use(route.routes()).use(route.allowedMethods());

const port = process.env.PORT || 8000;

const server = app.listen(port);
console.log(`Listening on port ${port}`);

process.on('SIGTERM', () => {
  server.close();
  process.exit(0);
});
