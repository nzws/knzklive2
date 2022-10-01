import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/tenants/_tenantId@number/lives';
import { lives } from '../../../models';
import type { APIRoute, TenantState, UserState } from '../../../utils/types';
import { validateWithType } from '../../../utils/validate';

type Query = Methods['get']['query'];
type Response = Methods['get']['resBody'];

const querySchema: JSONSchemaType<Query> = {
  type: 'object',
  properties: {
    page: {
      type: 'number',
      minimum: 1,
      nullable: true
    }
  },
  additionalProperties: false
};

export const getV1TenantsPrivateLives: APIRoute<
  never,
  Query,
  never,
  Response,
  UserState & TenantState
> = async ctx => {
  const query = ctx.request.query;
  if (!validateWithType(querySchema, query)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const take = 20;
  const list = await lives.getList(ctx.state.tenant.id, take, query.page ?? 1);

  ctx.body = {
    lives: list.map(live =>
      lives.getPrivate({
        ...live,
        tenant: ctx.state.tenant
      })
    ),
    // todo: 曖昧
    hasNext: list.length === take
  };
};
