import { Methods } from 'api-types/api/v1/lives/_tenantId@number/_idInTenant@number';
import { lives } from '../../../models';
import { APIRoute, TenantState } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1Lives: APIRoute<
  'liveIdInTenant',
  never,
  never,
  Response,
  TenantState
> = async ctx => {
  const liveIdInTenant = parseInt(
    (ctx.params as Record<string, string>).liveIdInTenant || '',
    10
  );
  if (!liveIdInTenant || isNaN(liveIdInTenant) || liveIdInTenant <= 0) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_live_id'
    };
    return;
  }

  const live = await lives.getByTenantLiveId(
    ctx.state.tenant.id,
    liveIdInTenant
  );
  if (!live) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'live_not_found'
    };
    return;
  }

  ctx.body = lives.getPublic(live);
};
