import { Middleware } from 'koa';
import { TenantState, UserState } from '../utils/types';

export const middlewareMyTenant: Middleware<UserState & TenantState> = async (
  ctx,
  next
) => {
  const { user, tenant } = ctx.state;
  if (!user || !tenant) {
    ctx.status = 500;
    ctx.body = { errorCode: 'internal_server_error' };
    return;
  }

  if (user.id !== tenant.ownerId) {
    ctx.status = 403;
    ctx.body = { errorCode: 'forbidden' };
    return;
  }

  await next();
};
