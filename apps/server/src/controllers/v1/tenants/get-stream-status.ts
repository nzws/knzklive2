import { Methods } from 'api-types/api/v1/tenants/_tenantId@number/stream-status';
import { lives } from '../../../models';
import { APIRoute, TenantState, UserState } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1TenantStreamStatus: APIRoute<
  never,
  never,
  never,
  Response,
  UserState & TenantState
> = async ctx => {
  const [live] = await lives.findMany({
    where: {
      userId: ctx.state.user.id,
      tenantId: ctx.state.tenant.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 1,
    include: {
      thumbnail: true
    }
  });

  ctx.body = {
    recently: live ? lives.getPrivate(live) : undefined
  };
};
