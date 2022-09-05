import type { JSONSchemaType } from 'ajv';
import type { Methods } from 'api-types/api/v1/auth/mastodon/login';
import { AuthMastodon } from '../../../../services/auth-providers/mastodon';
import type { APIRoute } from '../../../../utils/types';
import { validateWithType } from '../../../../utils/validate';

type Params = Methods['get']['query'];

const schema: JSONSchemaType<Params> = {
  type: 'object',
  properties: {
    domain: {
      type: 'string',
      minLength: 1
    },
    tenantId: {
      type: 'number',
      minLength: 1,
      maxLength: 10
    }
  },
  required: ['domain', 'tenantId'],
  additionalProperties: false
};

export const v1AuthMastodonLogin: APIRoute<
  never,
  Params,
  never,
  never
> = async ctx => {
  const query = ctx.request.query;
  if (!validateWithType(schema, query)) {
    ctx.code = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const tenantId = query.tenantId;
  if (isNaN(tenantId) || !tenantId) {
    ctx.code = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const provider = new AuthMastodon(query.domain);
  const url = await provider.getAuthUrl();

  ctx.cookies.set('tenantId', tenantId.toString(), {
    httpOnly: true
  });

  ctx.redirect(url);
};
