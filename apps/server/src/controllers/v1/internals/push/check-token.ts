import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/internals/push/check-token';
import { lives } from '../../../../models';
import { jwtEdge } from '../../../../services/jwt';
import { APIRoute } from '../../../../utils/types';
import { validateWithType } from '../../../../utils/validate';

type Request = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    liveId: {
      type: 'number',
      minimum: 1
    },
    pushToken: {
      type: 'string'
    },
    watchToken: {
      type: 'string'
    },
    serverToken: {
      type: 'string'
    }
  },
  required: ['liveId', 'pushToken', 'watchToken', 'serverToken'],
  additionalProperties: false
};

export const postV1InternalsPushCheckToken: APIRoute<
  never,
  never,
  Request,
  Response
> = async ctx => {
  if (!validateWithType(reqBodySchema, ctx.request.body)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const valid = await jwtEdge.verify(ctx.request.body.pushToken);
  if (!valid) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request',
      message: 'Invalid pushToken'
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

  if (live.watchToken !== ctx.request.body.watchToken) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request',
      message: 'Invalid watch token'
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
  ctx.body = {
    success: true
  };
};
