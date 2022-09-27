import { Methods } from 'api-types/api/v1/tenants';
import { lives, tenants } from '../../../models';
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
  const liveList = await lives.findMany({
    where: {
      tenant: {
        id: {
          in: tenant.map(t => t.id)
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 1,
    include: {
      thumbnail: true
    }
  });

  ctx.body = tenant.map(t => {
    const live = liveList.find(l => l.tenantId === t.id);

    return {
      tenant: tenants.getPublic(t),
      recentLive: live ? lives.getPrivate(live) : undefined
    };
  });
};
