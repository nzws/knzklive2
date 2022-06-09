import type { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/auth/mastodon/revoke';
import { UserToken } from '../../../../redis/user-token';
import { AuthMastodon } from '../../../../services/auth-providers/mastodon';
import type { APIRoute } from '../../../../utils/types';
import { validateWithType } from '../../../../utils/validate';

export type Params = Methods['post']['reqBody'];
export type Response = Methods['post']['resBody'];

const userToken = new UserToken();

const schema: JSONSchemaType<Params> = {
  type: 'object',
  properties: {
    domain: {
      type: 'string',
      minLength: 1,
      nullable: true
    },
    mastodonToken: {
      type: 'string',
      minLength: 1,
      nullable: true
    },
    liveToken: {
      type: 'string',
      minLength: 1,
      nullable: true
    }
  },
  additionalProperties: false
};

export const v1AuthMastodonRevoke: APIRoute<
  never,
  never,
  Params,
  Response
> = async ctx => {
  if (!validateWithType(schema, ctx.request.body)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }
  const query = ctx.request.body;

  if (query.domain && query.mastodonToken) {
    try {
      const provider = new AuthMastodon(query.domain);
      await provider.revokeToken(query.mastodonToken);
    } catch (e) {
      console.warn(e);
    }
  }

  if (query.liveToken) {
    try {
      await userToken.revoke(query.liveToken);
    } catch (e) {
      console.warn(e);
    }
  }

  ctx.body = {
    success: true
  };
};
