import { Methods } from 'api-types/api/v1/lives/find/_tenantDomain@string/_idInTenant@number';
import { lives } from '../../../models';
import { APIRoute, TenantState } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1LivesTop: APIRoute<
  never,
  never,
  never,
  Response,
  TenantState
> = async ctx => {
  const [live] = await lives.getPublicAndAlive(ctx.state.tenant.id);
  if (!live || !live.startedAt) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'live_not_found'
    };
    return;
  }

  ctx.body = lives.getPublic(live);
};
