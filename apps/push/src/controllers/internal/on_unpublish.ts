import { Middleware } from 'koa';
import { SRSUnPublishCallback } from '../../types';
import { client, serverToken } from '../../utils/api';
import { Action } from '../../services/action';

export const apiInternalOnUnPublish: Middleware = async ctx => {
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

  const liveId = parseInt(body.stream.split('_')[0], 10);
  if (!liveId) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: 'Invalid liveId or token'
    };
    return;
  }

  await Action.stopStream(liveId);

  void client.v1.internals.push.action.$post({
    body: {
      liveId,
      action: 'stream:stop',
      serverToken
    }
  });

  ctx.status = 200;
  ctx.body = {
    code: 0,
    message: 'OK'
  };
};
