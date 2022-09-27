import { Methods } from 'api-types/api/v1/tenants/find/_slug@string';
import { tenants } from '../../../models';
import type { APIRoute } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1TenantsOnce: APIRoute<
  'slug',
  never,
  never,
  Response
> = async ctx => {
  const { slug } = ctx.params;

  const tenant = await tenants.get(undefined, slug);

  if (!tenant) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'tenant_not_found'
    };
    return;
  }

  ctx.body = tenants.getPublic(tenant);
};
