import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/video/api/externals/v1/recording/unpublish';
import { Middleware } from 'koa';
import { validateWithType } from '../../../utils/validate';
import { Action } from '../../../services/action';

type Requests = Methods['post']['reqBody'];

const schema: JSONSchemaType<Requests> = {
  type: 'object',
  properties: {
    liveId: { type: 'number' },
    watchToken: { type: 'string' },
    serverToken: { type: 'string' }
  },
  required: ['liveId', 'watchToken', 'serverToken'],
  additionalProperties: false
};

export const apiExternalRecordingUnPublish: Middleware = ctx => {
  const body = ctx.request.body;
  if (!validateWithType(schema, body)) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: 'Invalid request body'
    };
    return;
  }

  void Action.unpublishRecording(body.liveId, body.watchToken);

  ctx.status = 200;
  ctx.body = {
    code: 0,
    message: 'OK'
  };
};
