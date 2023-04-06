import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/internals/video/check-outdated';
import { liveRecordings } from '../../../../models';
import { APIRoute } from '../../../../utils/types';
import { validateWithType } from '../../../../utils/validate';

type Request = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    serverToken: {
      type: 'string'
    },
    exceededSize: {
      type: 'string'
    }
  },
  required: ['serverToken', 'exceededSize'],
  additionalProperties: false
};

export const postV1InternalsVideoCheckOutdated: APIRoute<
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

  const outdatedLives = await liveRecordings.getOutdatedLives(
    BigInt(body.exceededSize)
  );

  ctx.status = 200;
  ctx.body = {
    outdatedLives: outdatedLives.map(live => ({
      liveId: live.id,
      watchToken: live.watchToken || ''
    }))
  };
};
