import { Methods } from 'api-types/api/v1/tenants/find/_slugOrId';
import { tenants } from '../../../models';
import type { APIRoute } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1TenantsOnce: APIRoute<
  'key',
  never,
  never,
  Response
> = async ctx => {
  const { key } = ctx.params;

  const id = Number(key);

  const tenant = id ? await tenants.get(id) : await tenants.get(undefined, key);

  if (!tenant) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'tenant_not_found'
    };
    return;
  }

  ctx.body = tenants.getPublic(tenant);
};
