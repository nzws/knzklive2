import { Middleware } from 'koa';
import { Encoder } from '../../services/encoder';
import { SRSPublishCallback } from '../../types';
import { client, serverToken } from '../../utils/api';
import { rejectSession, sessions } from '../../utils/sessions';

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

  try {
    await client.v1.internals.push.check_token.$post({
      body: {
        liveId,
        watchToken,
        pushToken: token,
        serverToken
      }
    });
  } catch (e) {
    console.warn(e);
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: 'Invalid token'
    };
    return;
  }

  const currentSession = sessions.get(liveId);
  if (currentSession) {
    await rejectSession(liveId);
  }

  await client.v1.internals.push.action.$post({
    body: {
      liveId,
      action: 'start',
      serverToken
    }
  });
  const encoder = new Encoder(liveId, watchToken, token);

  sessions.set(liveId, {
    clientId: body.client_id,
    encoder
  });

  ctx.status = 200;
  ctx.body = {
    code: 0,
    message: 'OK'
  };

  setTimeout(() => {
    // todo: 公開開始
    void encoder.encodeToLowQualityHls();
    void encoder.encodeAudio();
  }, 1000);
};