import { tenantGet, tenantGetDomain } from 'actions/tenant';
import { JSONSchemaType } from 'ajv';
import { APIRoute } from 'utils/types';
import { validate } from 'utils/validate';

export type Params = {
  code: string;
};

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
  const { valid } = validate<Params>(schema, query);
  if (!valid) {
    ctx.code = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const tenantId = parseInt(ctx.cookies.get('tenantId') || '', 10);
  if (!tenantId || typeof tenantId !== 'number' || isNaN(tenantId)) {
    ctx.code = 400;
    ctx.body = {
      errorCode: 'cookie_tenantId_not_found'
    };
    return;
  }

  const tenant = await tenantGet(tenantId);
  if (!tenant) {
    ctx.code = 404;
    ctx.body = {
      errorCode: 'tenant_not_found'
    };
    return;
  }

  ctx.redirect(
    `${protocol}://${tenantGetDomain(tenant)}/auth/callback?code=${query.code}`
  );
};
