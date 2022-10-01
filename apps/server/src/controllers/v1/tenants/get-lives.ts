import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/tenants/find/_slugOrId/lives';
import { lives, tenants } from '../../../models';
import { LiveWatching } from '../../../services/redis/live-watching';
import type { APIRoute } from '../../../utils/types';
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

const liveWatching = new LiveWatching();

export const getV1TenantsLives: APIRoute<
  'key',
  Query,
  never,
  Response
> = async ctx => {
  const query = ctx.request.query;
  const { key } = ctx.params;
  if (!validateWithType(querySchema, query)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const id = Number(key);
  const tenant = id ? await tenants.get(id) : await tenants.get(undefined, key);
  if (!tenant) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'tenant_not_found'
    };
    return;
  }

  const take = 21;
  const list = await lives.getList(tenant.id, take, query.page ?? 1);
  const accessibleLives = list.filter(live =>
    lives.isAccessibleInformationByUser(live, ctx.state.userId)
  );

  const currentLives = accessibleLives.filter(live => !live.endedAt);
  const realtimeCounts = await Promise.all(
    currentLives.map(live => liveWatching.get(live.id))
  );

  ctx.body = {
    lives: accessibleLives.map(live => {
      const liveData = lives.getPublic({
        ...live,
        tenant
      });
      if (live.endedAt) {
        return liveData;
      }

      const index = currentLives.findIndex(c => c.id === live.id);
      return {
        ...liveData,
        watchingCurrentCount: realtimeCounts[index]?.current
      };
    }),
    // todo: 曖昧
    hasNext: list.length === take
  };
};
