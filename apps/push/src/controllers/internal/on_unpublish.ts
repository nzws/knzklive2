import { Middleware } from 'koa';
import { jwt } from '../../services/jwt';
import { SRSUnPublishCallback } from '../../types';
import { client, serverToken } from '../../utils/api';
import { rejectSession, sessions } from '../../utils/sessions';

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

  await client.v1.internals.push.action.$post({
    body: {
      liveId,
      action: 'stop',
      serverToken
    }
  });

  void sessions.get(liveId)?.encoder.cleanup();
  await rejectSession(liveId);

  ctx.status = 200;
  ctx.body = {
    code: 0,
    message: 'OK'
  };
};