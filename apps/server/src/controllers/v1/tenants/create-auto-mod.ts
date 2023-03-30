import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/tenants/_tenantId@number/auto-mod';
import { commentAutoMods, comments, lives } from '../../../models';
import { APIRoute, TenantState, UserState } from '../../../utils/types';
import { validateWithType } from '../../../utils/validate';

type Request = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['Account', 'Domain', 'Text']
    },
    value: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    }
  },
  required: ['type', 'value'],
  additionalProperties: false
};

export const postV1TenantsAutoMod: APIRoute<
  never,
  never,
  Request,
  Response,
  UserState & TenantState
> = async ctx => {
  if (!validateWithType(reqBodySchema, ctx.request.body)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const current = await commentAutoMods.findFirst({
    where: {
      tenantId: ctx.state.tenant.id,
      type: ctx.request.body.type,
      value: ctx.request.body.value
    }
  });
  if (current) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request',
      message: 'そのルールは既に存在します'
    };
    return;
  }

  const result = await commentAutoMods.createItem(
    ctx.state.tenant.id,
    ctx.request.body.type,
    ctx.request.body.value
  );

  if (!result) {
    ctx.status = 500;
    ctx.body = {
      errorCode: 'internal_server_error'
    };
    return;
  }

  try {
    const currentLive = await lives.findFirst({
      where: {
        tenantId: ctx.state.tenant.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (currentLive) {
      await comments.applyAutoMod(currentLive.tenantId, currentLive.id);
    }
  } catch (e) {
    console.error(e);
  }

  ctx.body = {
    success: true
  };
};
