import { JSONSchemaType } from 'ajv';
import { AuthMastodon } from 'services/auth-providers/mastodon';
import { APIRoute } from 'utils/types';
import { validate } from 'utils/validate';

export type Params = {
  domain: string;
  token: string;
};

export type Response = {
  success: boolean;
};

const schema: JSONSchemaType<Params> = {
  type: 'object',
  properties: {
    domain: {
      type: 'string',
      minLength: 1
    },
    token: {
      type: 'string',
      minLength: 1
    }
  },
  required: ['domain', 'token'],
  additionalProperties: false
};

export const v1AuthMastodonRevoke: APIRoute<
  never,
  never,
  Params,
  Response
> = async ctx => {
  const query = ctx.request.body as Params;
  const { valid } = validate<Params>(schema, query);
  if (!valid) {
    ctx.code = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  try {
    const provider = new AuthMastodon(query.domain);
    await provider.revokeToken(query.token);
  } catch (e) {
    console.warn(e);
  }

  ctx.body = {
    success: true
  };
};
