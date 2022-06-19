import {
  tenantGet,
  tenantGetAsPublic,
  tenantGetSlugOrCustomDomain
} from 'actions/tenant';
import { checkDomain } from 'utils/domain';
import { APIRoute } from 'utils/types';

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
    const domain = tenantGetSlugOrCustomDomain(key);
    const tenant = await tenantGet(undefined, domain.slug, domain.customDomain);

    if (!tenant) {
      ctx.status = 404;
      ctx.body = {
        errorCode: 'tenant_not_found'
      };
      return;
    }

    ctx.body = tenantGetAsPublic(tenant);
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

  const tenant = await tenantGet(id);
  if (!tenant) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'tenant_not_found'
    };
    return;
  }

  ctx.body = tenantGetAsPublic(tenant);
};
