import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/video/api/externals/v1/recording/publish';
import { Middleware } from 'koa';
import { validateWithType } from '../../../utils/validate';
import { sessions } from '../../../utils/sessions';
import { Action } from '../../../services/action';

type Requests = Methods['post']['reqBody'];

const schema: JSONSchemaType<Requests> = {
  type: 'object',
  properties: {
    liveId: { type: 'number' },
    watchToken: { type: 'string' },
    serverToken: { type: 'string' },
    downloadUrl: { type: 'string' },
    originalBytes: { type: 'string' }
  },
  required: [
    'liveId',
    'watchToken',
    'serverToken',
    'downloadUrl',
    'originalBytes'
  ],
  additionalProperties: false
};

export const apiExternalRecordingPublish: Middleware = ctx => {
  const body = ctx.request.body;
  if (!validateWithType(schema, body)) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: 'Invalid request body'
    };
    return;
  }
  if (sessions.has(body.liveId)) {
    ctx.status = 400;
    ctx.body = {
      code: 400,
      message: 'Already processing'
    };
    return;
  }

  void Action.publishRecording(
    body.liveId,
    body.watchToken,
    body.downloadUrl,
    body.originalBytes
  );

  ctx.status = 200;
  ctx.body = {
    code: 0,
    message: 'OK'
  };
};
