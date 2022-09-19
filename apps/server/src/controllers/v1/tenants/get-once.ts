import { Methods } from 'api-types/api/v1/tenants/find/_key';
import { tenants } from '../../../models';
import { checkDomain, getSlugOrCustomDomain } from '../../../utils/domain';
import type { APIRoute } from '../../../utils/types';

type Response = Methods['get']['resBody'];

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
