import Router from '@koa/router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import { BackendApi } from './services/backend-api';
import { Jwt } from './services/jwt';
import { kickoffClient } from './services/srs-api';
import { FlvStream } from './services/stream';
import { SRSCallback, SRSPublishCallback, SRSUnPublishCallback } from './types';

const LIVE_API = process.env.SERVER_ENDPOINT || '';
const LOCAL_FLV = process.env.LOCAL_FLV_ENDPOINT || 'http://srs:8080';

let sessions: {
  clientId: string;
  liveId: number;
  stream: FlvStream;
}[] = [];

const jwt = new Jwt(`${LIVE_API}/v1/internals/edge/jwt`, 'edge');
const backend = new BackendApi(msg => {
  if (msg.action === 'end') {
    void rejectSession(msg.liveId);
  }
});

const rejectSession = async (liveId: number) => {
  const session = sessions.find(s => s.liveId === liveId);
  if (!session) {
    console.warn('session not found', liveId);
    return;
  }

  try {
    session.stream.disconnectAll();
    await kickoffClient(session.clientId);
  } catch (e) {
    console.warn('kickoff client failed', e);
  }

  sessions = sessions.filter(s => s.liveId !== liveId);
};

const app = new Koa();
app.use(bodyParser());
app.use(logger());

const route = new Router();

route.post('/api/v1/on_publish', async ctx => {
  const body = ctx.request.body as SRSPublishCallback;
  console.log('on_publish', body);
  if (body.action !== 'on_publish') {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: 'Invalid action'
    };
    return;
  }

  const liveId = parseInt(body.stream, 10);
  // todo: 仮
  const token = body.param.replace('?token=', '');
  if (!liveId || !token) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: 'Invalid liveId or token'
    };
    return;
  }

  try {
    await BackendApi.checkToken(liveId, token, false);
  } catch (e) {
    console.warn(e);
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: 'Invalid token'
    };
    return;
  }

  if (sessions.find(s => s.liveId === liveId)) {
    await rejectSession(liveId);
  }

  const session = new FlvStream(
    liveId,
    token,
    `${LOCAL_FLV}/live/${liveId}.flv?token=${token}`
  );
  sessions.push({
    clientId: body.client_id,
    liveId,
    stream: session
  });

  backend.send({
    action: 'start',
    liveId,
    token
  });

  ctx.status = 200;
  ctx.body = {
    code: 0,
    message: 'OK'
  };
});

route.post('/api/v1/on_unpublish', async ctx => {
  const body = ctx.request.body as SRSUnPublishCallback;
  console.log('on_unpublish', body);
  if (body.action !== 'on_unpublish') {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: 'Invalid action'
    };
    return;
  }

  const liveId = parseInt(body.stream, 10);
  const token = body.param.replace('?token=', '');
  if (!liveId || !token) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: 'Invalid liveId or token'
    };
    return;
  }

  const verify = await jwt.verify(token);
  if (
    !verify ||
    !verify.liveId ||
    verify.liveId !== liveId ||
    verify.type !== 'push'
  ) {
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: 'Invalid token'
    };
    return;
  }

  await rejectSession(liveId);

  backend.send({
    action: 'stop',
    liveId,
    token
  });

  ctx.status = 200;
  ctx.body = {
    code: 0,
    message: 'OK'
  };
});

route.post('/api/v1/on_play', async ctx => {
  const body = ctx.request.body as SRSCallback;
  console.log('play', body);

  const liveId = parseInt(body.stream, 10);
  const token = body.param.replace('?token=', '');
  if (!liveId || !token) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: 'Invalid liveId or token'
    };
    return;
  }

  const verify = await jwt.verify(token);
  if (!verify || !verify.liveId || verify.liveId !== liveId) {
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: 'Invalid token'
    };
    return;
  }

  if (!sessions.find(s => s.liveId === liveId)) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: 'Live not found'
    };
    return;
  }

  ctx.status = 200;
  ctx.body = {
    code: 0,
    message: 'OK'
  };
});

app.use(route.routes()).use(route.allowedMethods());

const port = process.env.PORT || 8000;

const server = app.listen(port);
console.log(`Listening on port ${port}`);

process.on('SIGTERM', () => {
  server.close();
  process.exit(0);
});
