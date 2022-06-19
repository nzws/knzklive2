import { JSONSchemaType } from 'ajv';
import { AuthMastodon } from 'services/auth-providers/mastodon';
import { APIRoute } from 'utils/types';
import { validate } from 'utils/validate';

export type Params = {
  tenantId: string;
  domain: string;
};

const schema: JSONSchemaType<Params> = {
  type: 'object',
  properties: {
    domain: {
      type: 'string',
      minLength: 1
    },
    tenantId: {
      type: 'string',
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
  const { valid } = validate<Params>(schema, query);
  if (!valid) {
    ctx.code = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const tenantId = parseInt(query.tenantId, 10);
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
