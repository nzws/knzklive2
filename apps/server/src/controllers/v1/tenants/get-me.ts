import { Methods } from 'api-types/api/v1/tenants';
import { tenants } from '../../../models';
import type { APIRoute, UserState } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1TenantsMe: APIRoute<
  never,
  never,
  never,
  Response,
  UserState
> = async ctx => {
  const tenant = await tenants.findMany({
    where: {
      owner: {
        id: ctx.state.user.id
      }
    }
  });
  if (!tenant) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'tenant_not_found'
    };
    return;
  }

  ctx.body = tenant.map(t => tenants.getPublic(t));
};
