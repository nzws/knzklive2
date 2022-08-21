import { tenants } from '@server/models';
import { checkDomain, getSlugOrCustomDomain } from '@server/utils/domain';
import type { APIRoute } from '@server/utils/types';

export type Response = {
  id: number;
  slug: string;
  ownerId: number;
  displayName?: string;
  customDomain?: string;
};

export const getV1TenantsOnce: APIRoute<
  'key',
  never,
  never,
  Response
> = async ctx => {
  const { key } = ctx.params;

  if (checkDomain(key)) {
    const domain = getSlugOrCustomDomain(key);
    const tenant = await tenants.get(
      undefined,
      domain.slug,
      domain.customDomain
    );

    if (!tenant) {
      ctx.status = 404;
      ctx.body = {
        errorCode: 'tenant_not_found'
      };
      return;
    }

    ctx.body = tenants.getPublic(tenant);
    return;
  }

  const id = parseInt(key, 10);
  if (isNaN(id) || id <= 0) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const tenant = await tenants.get(id);
  if (!tenant) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'tenant_not_found'
    };
    return;
  }

  ctx.body = tenants.getPublic(tenant);
};
