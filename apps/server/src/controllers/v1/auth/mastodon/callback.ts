import type { JSONSchemaType } from 'ajv';
import type { Methods } from 'api-types/api/v1/auth/mastodon/callback';
import { tenants } from '../../../../models';
import { getTenantPrimaryDomain } from '../../../../utils/domain';
import type { APIRoute } from '../../../../utils/types';
import { validateWithType } from '../../../../utils/validate';

type Params = Methods['post']['reqBody'];

const schema: JSONSchemaType<Params> = {
  type: 'object',
  properties: {
    code: {
      type: 'string',
      minLength: 1
    }
  },
  required: ['code'],
  additionalProperties: false
};

const protocol = process.env.USE_HTTP ? 'http' : 'https';

export const v1AuthMastodonCallback: APIRoute<never, Params> = async ctx => {
  const query = ctx.request.query;
  if (!validateWithType(schema, query)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const tenantId = parseInt(ctx.cookies.get('tenantId') || '', 10);
  if (!tenantId || typeof tenantId !== 'number' || isNaN(tenantId)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'cookie_tenantId_not_found'
    };
    return;
  }

  const tenant = await tenants.get(tenantId);
  if (!tenant) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'tenant_not_found'
    };
    return;
  }

  const host = `${protocol}://${getTenantPrimaryDomain(tenant)}`;

  ctx.redirect(`${host}/auth/callback?code=${query.code}`);
};
