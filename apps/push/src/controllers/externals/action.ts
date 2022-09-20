import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/push/api/externals/v1/action';
import { Middleware } from 'koa';
import { rejectSession } from '../../utils/sessions';
import { validateWithType } from '../../utils/validate';

type Requests = Methods['post']['reqBody'];

const schema: JSONSchemaType<Requests> = {
  type: 'object',
  properties: {
    liveId: { type: 'number' },
    action: { type: 'string' },
    serverToken: { type: 'string' }
  },
  required: ['liveId', 'action', 'serverToken'],
  additionalProperties: false
};

export const apiExternalAction: Middleware = ctx => {
  const body = ctx.request.body;
  if (!validateWithType(schema, body)) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: 'Invalid request body'
    };
    return;
  }

  if (!['end'].includes(body.action)) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: 'Invalid action'
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

  if (body.action === 'end') {
    void rejectSession(body.liveId);
  }

  ctx.status = 200;
  ctx.body = {
    code: 0,
    message: 'OK'
  };
};
