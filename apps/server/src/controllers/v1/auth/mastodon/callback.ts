import type { JSONSchemaType } from 'ajv';
import type { Methods } from 'api-types/api/v1/auth/mastodon/callback';
import type { APIRoute } from '../../../../utils/types';
import { validateWithType } from '../../../../utils/validate';

type Params = Methods['post']['reqBody'];

const schema: JSONSchemaType<Params> = {
  type: 'object',
  properties: {
    code: {
      type: 'string',
      minLength: 1
    }
  },
  required: ['code'],
  additionalProperties: false
};

export const v1AuthMastodonCallback: APIRoute<never, Params> = ctx => {
  const query = ctx.request.query;
  if (!validateWithType(schema, query)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const host = process.env.FRONTEND_ENDPOINT || '';

  ctx.redirect(`${host}/auth/callback?code=${query.code}`);
};
