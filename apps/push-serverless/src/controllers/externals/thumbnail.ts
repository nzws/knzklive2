import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/push/api/externals/v1/thumbnail';
import { readFile } from 'fs/promises';
import { Middleware } from 'koa';
import { sessions } from '../../utils/sessions';
import { validateWithType } from '../../utils/validate';

type Requests = Methods['post']['reqBody'];

const schema: JSONSchemaType<Requests> = {
  type: 'object',
  properties: {
    liveId: { type: 'number' },
    serverToken: { type: 'string' },
    signedUploadUrl: { type: 'string' }
  },
  required: ['liveId', 'serverToken', 'signedUploadUrl'],
  additionalProperties: false
};

export const apiExternalThumbnail: Middleware = async ctx => {
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

  const session = sessions.get(body.liveId);
  if (!session) {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: 'Session not found'
    };
    return;
  }

  let path: string;
  try {
    path = await session.encoder.generateThumbnail();
    if (!path) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: 'No video track found in the stream'
      };
      return;
    }
  } catch (e) {
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: 'Failed to generate thumbnail'
    };
    return;
  }

  try {
    const buffer = await readFile(path);
    await fetch(body.signedUploadUrl, {
      method: 'PUT',
      body: buffer
    });
  } catch (e) {
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: 'Failed to upload thumbnail'
    };
    return;
  }

  ctx.status = 200;
  ctx.body = {
    code: 0,
    message: 'OK'
  };
};
