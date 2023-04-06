import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/internals/video/signal';
import { liveRecordings, lives } from '../../../../models';
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
      type: 'string',
      enum: [
        'record:processing',
        'record:done',
        'record:failed',
        'record:deleted'
      ]
    },
    serverToken: {
      type: 'string'
    },
    cacheSize: {
      type: 'string',
      nullable: true
    }
  },
  required: ['liveId', 'action', 'serverToken'],
  additionalProperties: false
};

export const postV1InternalsVideoSignal: APIRoute<
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

  await liveRecordings.update({
    where: {
      id: live.id
    },
    data: {
      cacheStatus:
        body.action === 'record:processing'
          ? 'Processing'
          : body.action === 'record:done'
          ? 'Completed'
          : body.action === 'record:failed'
          ? 'Failed'
          : 'Deleted',
      cacheSize: BigInt(body.cacheSize || 0)
    }
  });

  ctx.status = 200;
  ctx.body = {
    success: true
  };
};
