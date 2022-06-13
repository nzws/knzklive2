import { JSONSchemaType } from 'ajv';
import { Tenant } from 'services/tenant';
import { APIRoute } from 'utils/types';
import { validate } from 'utils/validate';

export type Params = {
  tenantId?: string;
  tenantDomain?: string;
};

export type Response = {
  id: number;
  slug: string;
  ownerId: number;
  displayName?: string;
  customDomain?: string;
};

const schema: JSONSchemaType<Params> = {
  type: 'object',
  properties: {
    tenantDomain: {
      type: 'string',
      nullable: true
    },
    tenantId: {
      type: 'string',
      nullable: true
    }
  },
  additionalProperties: false
};

export const getV1Tenant: APIRoute<Params, never, Response> = async ctx => {
  const query = ctx.request.query;
  const { valid } = validate<Params>(schema, query);
  if (!valid) {
    ctx.throw(400, 'Invalid request');
    return;
  }

  if (!query.tenantId && !query.tenantDomain) {
    ctx.throw(400, 'Invalid request');
    return;
  }

  const tenantClass = new Tenant(
    parseInt(query.tenantId || '', 10) || undefined,
    query.tenantDomain
  );
  const tenant = await tenantClass.getTenant();

  ctx.body = {
    id: tenant.id,
    slug: tenant.slug,
    ownerId: tenant.ownerId,
    displayName: tenant.displayName || undefined,
    customDomain: tenant.customDomain || undefined
  };
};
