import { Middleware } from 'koa';
import { SRSPublishCallback } from '../../types';
import { checkToken, client, serverToken } from '../../utils/api';
import { Action } from '../../services/action';

export const apiInternalOnPublish: Middleware = async ctx => {
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

  const [LiveId, watchToken] = body.stream.split('_');
  const liveId = parseInt(LiveId, 10);
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

  if (!(await checkToken(liveId, watchToken, token))) {
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: 'Invalid token'
    };
    return;
  }

  await Action.startStream(liveId, watchToken, body.client_id, body.stream_id);

  void client.v1.internals.push.action.$post({
    body: {
      liveId,
      action: 'stream:start',
      serverToken
    }
  });

  ctx.status = 200;
  ctx.body = {
    code: 0,
    message: 'OK'
  };
};
