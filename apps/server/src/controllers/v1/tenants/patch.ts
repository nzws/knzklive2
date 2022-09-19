import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/tenants/_tenantId@number';
import { tenants } from '../../../models';
import { APIRoute, TenantState, UserState } from '../../../utils/types';
import { validateWithType } from '../../../utils/validate';

type Request = Methods['patch']['reqBody'];
type Response = Methods['patch']['resBody'];

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    displayName: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      nullable: true
    },
    config: {
      type: 'object',
      properties: {
        autoRedirectInTopPage: {
          type: 'boolean',
          nullable: true
        },
        exploreInOtherTenants: {
          type: 'boolean',
          nullable: true
        }
      }
    }
  },
  required: ['config'],
  additionalProperties: false
};

export const patchV1Tenants: APIRoute<
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
  const body = ctx.request.body;

  await tenants.update({
    where: {
      id: ctx.state.tenant.id
    },
    data: {
      displayName: body.displayName,
      config: body.config
    }
  });

  ctx.body = {
    success: true
  };
};
