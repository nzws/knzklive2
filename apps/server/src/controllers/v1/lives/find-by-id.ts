import { Methods } from 'api-types/api/v1/lives/find/_slug@string/_idInTenant@number';
import { lives, tenants } from '../../../models';
import { APIRoute } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1LivesFindById: APIRoute<
  'liveIdInTenant' | 'slug',
  never,
  never,
  Response
> = async ctx => {
  const { liveIdInTenant, slug } = ctx.params;
  const tenant = await tenants.get(undefined, slug);

  if (!tenant) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'tenant_not_found'
    };
    return;
  }

  const id = parseInt(liveIdInTenant, 10);
  if (!id || isNaN(id) || id <= 0) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'live_not_found'
    };
    return;
  }

  const live = await lives.getByTenantLiveId(tenant.id, id);
  if (!live) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'live_not_found'
    };
    return;
  }

  const isAccessible = lives.isAccessibleInformationByUser(
    live,
    ctx.state.userId
  );
  if (!isAccessible) {
    ctx.status = 403;
    ctx.body = {
      errorCode: 'forbidden_live'
    };
    return;
  }

  ctx.body = lives.getPublic(live);
};
