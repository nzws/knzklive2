import { Middleware } from 'koa';
import { backendJwt } from '../../services/jwt';
import { SRSCallback } from '../../types';
import { sessions } from '../../utils/sessions';

export const apiInternalOnPlay: Middleware = async ctx => {
  const body = ctx.request.body as SRSCallback;
  console.log('play', body);

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

  const verify = await backendJwt.check(token, liveId);
  if (!verify) {
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: 'Invalid token'
    };
    return;
  }

  if (!sessions.get(liveId)) {
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
};
