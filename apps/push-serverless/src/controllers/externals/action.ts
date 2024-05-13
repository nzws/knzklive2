import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/push/api/externals/v1/action';
import { Middleware } from 'koa';
import { validateWithType } from '../../utils/validate';
import { Action } from '../../services/action';

type Requests = Methods['post']['reqBody'];

const schema: JSONSchemaType<Requests> = {
  type: 'object',
  properties: {
    liveId: { type: 'number' },
    action: { type: 'string', enum: ['end', 'start'] },
    serverToken: { type: 'string' },
    isRecording: { type: 'boolean', nullable: true }
  },
  required: ['liveId', 'action', 'serverToken'],
  additionalProperties: false
};

export const apiExternalAction: Middleware = async ctx => {
  const body = ctx.request.body;
  if (!validateWithType(schema, body)) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: 'Invalid request body'
    };
    return;
  }

  if (body.serverToken !== process.env.SERVER_TOKEN) {
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: 'Invalid serverToken'
    };
    return;
  }

  const liveId = body.liveId;
  if (body.action === 'end') {
    await Action.endLive(liveId);
  } else if (body.action === 'start') {
    Action.startLive(liveId, body.isRecording ?? false);
  }

  ctx.status = 200;
  ctx.body = {
    code: 0,
    message: 'OK'
  };
};
