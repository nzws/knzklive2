import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import cors from '@koa/cors';
import { router } from './router';
import { Streaming } from './streaming';
import { middlewareCatch } from './middlewares/catch';
import { middlewareGetUserId } from './middlewares/user-id';
import { MastodonStreaming } from './streaming/mastodon';
import { createBoard } from './services/queues/_board';
import { prisma } from './models';

export const app = async (): Promise<void> => {
  await prisma.$connect();

  const app = new Koa();
  app.use(middlewareCatch);
  app.use(bodyParser());
  app.use(logger());
  app.use(cors());
  app.use(middlewareGetUserId);

  if (process.env.ENABLE_QUEUE_DASHBOARD_YOU_HAVE_TO_PROTECT_IT) {
    app.use(createBoard('/admin/queues').registerPlugin());
  }

  const route = router();

  app.use(route.routes()).use(route.allowedMethods());

  const port = parseInt(process.env.PORT || '8080', 10);

  const server = app.listen(port, '0.0.0.0');
  console.log(`Listening on port ${port}`);

  new Streaming(server);
  const mastodon = new MastodonStreaming();
  await mastodon.prepareHashtag();
  mastodon.connect();

  process.on('SIGTERM', () => {
    void prisma.$disconnect();
    server.close();
    process.exit(0);
  });
};
