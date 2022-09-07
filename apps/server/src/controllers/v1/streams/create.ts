import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/streams';
import { lives, tenants } from '../../../models';
import { APIRoute, UserState } from '../../../utils/types';
import { validateWithType } from '../../../utils/validate';

type Request = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    description: {
      type: 'string',
      minLength: 0,
      maxLength: 1000,
      nullable: true
    },
    privacy: {
      type: 'string',
      enum: ['Public', 'Private']
    },
    sensitive: {
      type: 'boolean'
    },
    hashtag: {
      type: 'string',
      minLength: 0,
      maxLength: 100,
      nullable: true
    },
    tenantId: {
      type: 'number'
    }
  },
  required: ['title', 'privacy', 'sensitive', 'tenantId'],
  additionalProperties: false
};

export const postV1Streams: APIRoute<
  never,
  never,
  Request,
  Response,
  UserState
> = async ctx => {
  if (!validateWithType(reqBodySchema, ctx.request.body)) {
    ctx.code = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }
  const body = ctx.request.body;
  const tenant = await tenants.get(body.tenantId);
  if (!tenant || tenant.ownerId !== ctx.state.user.id) {
    ctx.code = 400;
    ctx.body = {
      errorCode: 'tenant_invalid'
    };
    return;
  }

  const live = await lives.createLive(
    tenant.id,
    ctx.state.user.id,
    body.title,
    body.privacy,
    body.description,
    body.hashtag
  );

  const livePublic = lives.getPublic(live);

  ctx.body = {
    live: livePublic
  };
};
