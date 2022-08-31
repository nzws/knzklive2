import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/comments/_liveId@number/index';
import { comments, lives, tenants } from '../../../models';
import { APIRouteWithAuth } from '../../../utils/types';
import { validateWithType } from '../../../utils/validate';

type Request = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

const paramsSchema: JSONSchemaType<{
  liveIdInTenant: number;
  tenantId: number;
}> = {
  type: 'object',
  properties: {
    tenantId: {
      type: 'number',
      minLength: 1
    },
    liveIdInTenant: {
      type: 'number',
      minLength: 1
    }
  },
  required: ['tenantId', 'liveIdInTenant'],
  additionalProperties: false
};

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    content: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    }
  },
  required: ['content'],
  additionalProperties: false
};

export const postV1Comment: APIRouteWithAuth<
  'tenantId' | 'liveIdInTenant',
  never,
  Request,
  Response
> = async ctx => {
  if (!validateWithType(paramsSchema, ctx.params)) {
    ctx.code = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }
  if (!validateWithType(reqBodySchema, ctx.request.body)) {
    ctx.code = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }
  const content = ctx.request.body.content;
  const { liveIdInTenant, tenantId } = ctx.params;

  if (content.trim().length <= 0) {
    ctx.code = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const tenant = await tenants.get(tenantId);
  if (!tenant) {
    ctx.code = 404;
    ctx.body = {
      errorCode: 'tenant_not_found'
    };
    return;
  }

  const live = await lives.getByTenantLiveId(tenant, liveIdInTenant);
  if (!live) {
    ctx.code = 404;
    ctx.body = {
      errorCode: 'not_found'
    };
    return;
  }

  const comment = await comments.createViaLocal(ctx.state.user, live, content);
  const result = comments.getPublic(comment);
  if (!result) {
    ctx.code = 500;
    ctx.body = {
      errorCode: 'internal_server_error'
    };
    return;
  }

  ctx.body = result;
};
