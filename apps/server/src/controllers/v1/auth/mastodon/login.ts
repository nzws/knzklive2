import type { JSONSchemaType } from 'ajv';
import type { Methods } from 'api-types/api/v1/auth/mastodon/login';
import { AuthMastodon } from '../../../../services/auth-providers/mastodon';
import type { APIRoute } from '../../../../utils/types';
import { validateWithType } from '../../../../utils/validate';

type Params = Methods['get']['query'];
type Response = Methods['get']['resBody'];

const schema: JSONSchemaType<Params> = {
  type: 'object',
  properties: {
    domain: {
      type: 'string',
      minLength: 1
    }
  },
  required: ['domain'],
  additionalProperties: false
};

export const v1AuthMastodonLogin: APIRoute<
  never,
  Params,
  never,
  Response
> = async ctx => {
  const query = ctx.request.query;
  if (!validateWithType(schema, query)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const provider = new AuthMastodon(query.domain);
  const url = await provider.getAuthUrl();

  ctx.redirect(url);
};
