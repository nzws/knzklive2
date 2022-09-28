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

  const liveList = await Promise.all(
    tenant.map(tenant =>
      lives.findFirst({
        where: {
          tenantId: tenant.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          thumbnail: true
        }
      })
    )
  );

  ctx.body = tenant.map((tenant, index) => {
    const live = liveList[index];

    return {
      tenant: tenants.getPublic(tenant),
      recentLive: live ? lives.getPrivate(live) : undefined
    };
  });
};
