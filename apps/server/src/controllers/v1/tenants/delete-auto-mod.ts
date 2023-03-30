import { Methods } from 'api-types/api/v1/tenants/_tenantId@number/auto-mod/_id@number';
import { commentAutoMods } from '../../../models';
import { APIRoute, TenantState, UserState } from '../../../utils/types';

type Response = Methods['delete']['resBody'];

export const deleteV1TenantsAutoMod: APIRoute<
  'id',
  Request,
  never,
  Response,
  UserState & TenantState
> = async ctx => {
  const id = parseInt(ctx.params.id, 10);
  if (!id || isNaN(id) || id <= 0) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'not_found'
    };
    return;
  }

  await commentAutoMods.remove(ctx.state.tenant.id, id);

  ctx.body = { success: true };
};
