import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/tenants';
import { tenants } from '../../../models';
import {
  InvalidSlugError,
  InviteAlreadyUsedError,
  NoInviteError,
  SlugAlreadyUsedError
} from '../../../models/tenant';
import { APIRoute, UserState } from '../../../utils/types';
import { validateWithType } from '../../../utils/validate';

type Request = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    inviteCode: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    slug: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    }
  },
  required: ['inviteCode', 'slug'],
  additionalProperties: false
};

export const postV1Tenants: APIRoute<
  never,
  never,
  Request,
  Response,
  UserState
> = async ctx => {
  if (!validateWithType(reqBodySchema, ctx.request.body)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }
  const body = ctx.request.body;
  const newSlug = body.slug?.toLowerCase();

  try {
    const tenant = await tenants.createTenantByInvite(
      newSlug,
      ctx.state.user,
      body.inviteCode
    );

    ctx.body = {
      tenant: tenants.getPublic(tenant)
    };
  } catch (e) {
    if (e instanceof InvalidSlugError) {
      ctx.status = 400;
      ctx.body = {
        errorCode: 'invalid_request',
        message: '配信者IDには半角英数字のみ使用できます'
      };
      return;
    }

    if (e instanceof SlugAlreadyUsedError) {
      ctx.status = 400;
      ctx.body = {
        errorCode: 'invalid_request',
        message: '配信者IDはすでに使われています'
      };
      return;
    }

    if (e instanceof InviteAlreadyUsedError) {
      ctx.status = 400;
      ctx.body = {
        errorCode: 'invalid_request',
        message: '招待コードはすでに使われています'
      };
      return;
    }

    if (e instanceof NoInviteError) {
      ctx.status = 400;
      ctx.body = {
        errorCode: 'invalid_request',
        message: '招待コードが見つかりません'
      };
      return;
    }

    throw e;
  }
};
