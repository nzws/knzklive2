import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/internals/push/action';
import { lives } from '../../../../models';
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
    action: {
      type: 'string'
    },
    serverToken: {
      type: 'string'
    }
  },
  required: ['liveId', 'action', 'serverToken'],
  additionalProperties: false
};

export const postV1InternalsPushAction: APIRoute<
  never,
  never,
  Request,
  Response
> = async ctx => {
  const body = ctx.request.body;
  if (!validateWithType(reqBodySchema, body)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const live = await lives.get(body.liveId);
  if (!live) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'not_found'
    };
    return;
  }

  if (body.action === 'start') {
    await lives.startStream(live);
  } else if (body.action === 'stop') {
    await lives.stopStream(live);
  } else {
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
