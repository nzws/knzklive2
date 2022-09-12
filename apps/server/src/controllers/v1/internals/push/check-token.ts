import { JSONSchemaType } from 'ajv';
import { Middleware } from 'koa';
import { lives } from '../../../../models';
import { jwtEdge } from '../../../../services/jwt';
import { validateWithType } from '../../../../utils/validate';

type Request = {
  liveId: number;
  token: string;
};

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    liveId: {
      type: 'number',
      minimum: 1
    },
    token: {
      type: 'string'
    }
  },
  required: ['liveId', 'token'],
  additionalProperties: false
};

export const getV1InternalsPushCheckToken: Middleware = async ctx => {
  if (!validateWithType(reqBodySchema, ctx.request.body)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const valid = await jwtEdge.verify(ctx.request.body.token);
  if (!valid) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const live = await lives.get(ctx.request.body.liveId);
  if (!live) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'not_found'
    };
    return;
  }

  if (live.endedAt) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  ctx.status = 200;
  ctx.body = 'ok';
};
