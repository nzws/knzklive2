import { Methods } from 'api-types/api/v1/tenants/_tenantId@number/auto-mod';
import { commentAutoMods } from '../../../models';
import type { APIRoute, TenantState, UserState } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1TenantsAutoMod: APIRoute<
  never,
  never,
  never,
  Response,
  UserState & TenantState
> = async ctx => {
  const list = await commentAutoMods.getList(ctx.state.tenant.id);

  ctx.body = list.map(x => commentAutoMods.getPrivate(x));
};
