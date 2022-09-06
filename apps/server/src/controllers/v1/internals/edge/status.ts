import { JSONSchemaType } from 'ajv';
import { Middleware } from 'koa';
import { lives, streams } from '../../../../models';
import { jwtEdge } from '../../../../services/jwt';
import { validateWithType } from '../../../../utils/validate';

type Request = {
  token: string;
  liveId: number;
  status: 'start' | 'stop';
};

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    token: {
      type: 'string',
      minLength: 1
    },
    liveId: {
      type: 'number',
      minimum: 1
    },
    status: {
      type: 'string',
      enum: ['start', 'stop']
    }
  },
  required: ['token', 'liveId', 'status'],
  additionalProperties: false
};

export const postV1InternalsEdgeStatus: Middleware = async ctx => {
  if (!validateWithType(reqBodySchema, ctx.request.body)) {
    ctx.code = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }
  const payload = await jwtEdge.verify(ctx.request.body.token);
  if (!payload) {
    ctx.code = 403;
    ctx.body = {
      errorCode: 'token_invalid'
    };
    return;
  }
  if (payload.liveId !== ctx.request.body.liveId || payload.type !== 'push') {
    ctx.code = 403;
    ctx.body = {
      errorCode: 'token_invalid'
    };
    return;
  }

  const live = await lives.findUnique({
    where: {
      id: ctx.request.body.liveId
    },
    include: {
      stream: true
    }
  });
  if (!live) {
    ctx.code = 404;
    ctx.body = {
      errorCode: 'live_not_found'
    };
    return;
  }

  try {
    if (ctx.request.body.status === 'start') {
      await streams.startStream(live.stream);
    } else {
      await streams.stopStream(live.stream);
    }
  } catch (e) {
    console.warn(e);

    ctx.code = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  ctx.body = 'ok';
};
