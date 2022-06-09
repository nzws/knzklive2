import { JSONSchemaType } from 'ajv';
import { prisma } from 'utils/prisma';
import { getTenantDomain } from 'utils/tenant';
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

export const v1AuthMastodonCallback: APIRoute<Params> = async ctx => {
  const query = ctx.request.query;
  const { valid } = validate<Params>(schema, query);
  if (!valid) {
    ctx.throw(400, 'Invalid request');
    return;
  }

  const tenantId = parseInt(ctx.cookies.get('tenantId') || '', 10);
  if (!tenantId || typeof tenantId !== 'number' || isNaN(tenantId)) {
    ctx.throw(400, 'Failed to get cookie.tenantId');
    return;
  }

  const tenant = await prisma.tenant.findUnique({
    where: {
      id: tenantId
    }
  });
  if (!tenant) {
    ctx.throw(400, 'Failed to get tenant');
    return;
  }

  ctx.redirect(
    `://${getTenantDomain(
      tenant.slug,
      tenant.customDomain
    )}/auth/callback?code=${query.code}`
  );
};
