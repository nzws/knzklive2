import type { Middleware } from 'koa';
import { tenants } from '../models';

export const middlewareTenant: Middleware = async (ctx, next) => {
  const tenantId = parseInt(
    (ctx.params as Record<string, string>).tenantId || '',
    10
  );
  if (!tenantId || isNaN(tenantId) || tenantId <= 0) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'tenant_not_found'
    };
    return;
  }

  const data = await tenants.get(tenantId);
  if (!data) {
    ctx.code = 404;
    ctx.body = {
      errorCode: 'tenant_not_found'
    };
    return;
  }

  ctx.state.tenant = data;

  await next();
};
