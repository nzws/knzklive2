import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/tenants/_tenantId@number';
import { tenants } from '../../../models';
import { InvalidSlugError, SlugAlreadyUsedError } from '../../../models/tenant';
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
    slug: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      nullable: true
    },
    config: {
      type: 'object',
      properties: {
        exploreInOtherTenants: {
          type: 'boolean',
          nullable: true
        },
        webhookUrl: {
          type: 'string',
          nullable: true,
          maxLength: 200
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
  const newSlug = body.slug?.toLowerCase();

  if (newSlug && newSlug !== ctx.state.tenant.slug) {
    try {
      await tenants.checkIsValidSlug(newSlug);
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
    }
  }

  await tenants.update({
    where: {
      id: ctx.state.tenant.id
    },
    data: {
      displayName: body.displayName,
      slug: newSlug,
      config: body.config
    }
  });

  ctx.body = {
    success: true
  };
};
