import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/streams/_liveId@number';
import { lives } from '../../../models';
import { APIRoute, LiveState, UserState } from '../../../utils/types';
import { validateWithType } from '../../../utils/validate';

type Request = Methods['patch']['reqBody'];
type Response = Methods['patch']['resBody'];

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      nullable: true
    },
    description: {
      type: 'string',
      minLength: 0,
      maxLength: 1000,
      nullable: true
    },
    sensitive: {
      type: 'boolean',
      nullable: true
    }
  },
  additionalProperties: false
};

export const patchV1Streams: APIRoute<
  never,
  never,
  Request,
  Response,
  UserState & LiveState
> = async ctx => {
  if (!validateWithType(reqBodySchema, ctx.request.body)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }
  const body = ctx.request.body;

  await lives.update({
    where: {
      id: ctx.state.live.id
    },
    data: {
      title: body.title,
      description: body.description,
      sensitive: body.sensitive
    }
  });

  ctx.body = {
    success: true
  };
};
