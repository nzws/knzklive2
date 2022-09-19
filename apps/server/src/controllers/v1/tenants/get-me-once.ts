import { Methods } from 'api-types/api/v1/tenants/_tenantId@number';
import { tenants } from '../../../models';
import type { APIRoute, TenantState, UserState } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1TenantsMeOnce: APIRoute<
  never,
  never,
  never,
  Response,
  UserState & TenantState
> = ctx => {
  ctx.body = {
    tenant: tenants.getPublic(ctx.state.tenant),
    config: tenants.getConfig(ctx.state.tenant)
  };
};
