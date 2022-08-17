import { JSONSchemaType } from 'ajv';
import { users } from '~/models';
import { AuthMastodon } from '~/services/auth-providers/mastodon';
import { ExternalUser } from '~/services/auth-providers/_base';
import { UserToken } from '~/services/token/user-token';
import { APIRoute } from '~/utils/types';
import { validate } from '~/utils/validate';

export type Params = {
  domain: string;
  token: string;
};

export type Response = {
  liveToken: string;
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

const userToken = new UserToken();

export const v1AuthMastodonRefresh: APIRoute<
  never,
  never,
  Params,
  Response
> = async ctx => {
  const query = ctx.request.body;
  const { valid } = validate<Params>(schema, query);
  if (!valid) {
    ctx.code = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  let authUser: ExternalUser;

  try {
    const provider = new AuthMastodon(query.domain);
    authUser = await provider.getUser(query.token);

    if (!authUser.account) {
      ctx.code = 500;
      ctx.body = {
        errorCode: 'internal_error'
      };
      return;
    }
  } catch (e) {
    console.warn(e);

    ctx.code = 400;
    ctx.body = {
      errorCode: 'invalid_response_from_provider'
    };
    return;
  }

  const currentUser = await users.get(undefined, authUser.account);
  if (!currentUser) {
    ctx.code = 403;
    ctx.body = {
      errorCode: 'user_not_found'
    };
    return;
  }

  await users.update(currentUser, {
    avatarUrl: authUser.avatarUrl,
    displayName: authUser.displayName,
    lastSignedInAt: new Date()
  });

  const liveToken = await userToken.getToken(currentUser);

  ctx.body = {
    liveToken
  };
};
