import { userCreate, userGet, userUpdate } from 'actions/user';
import { JSONSchemaType } from 'ajv';
import { AuthMastodon } from 'services/auth-providers/mastodon';
import { ExternalUser } from 'services/auth-providers/_base';
import { UserToken } from 'services/token/user-token';
import { APIRoute } from 'utils/types';
import { validate } from 'utils/validate';

export type Params = {
  domain: string;
  code: string;
};

export type Response = {
  mastodonToken: string;
  liveToken: string;
};

const schema: JSONSchemaType<Params> = {
  type: 'object',
  properties: {
    code: {
      type: 'string',
      minLength: 1
    },
    domain: {
      type: 'string',
      minLength: 1
    }
  },
  required: ['code', 'domain'],
  additionalProperties: false
};

const userToken = new UserToken();

export const v1AuthMastodonToken: APIRoute<
  never,
  Params,
  never,
  Response
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

  let mastodonToken: string;
  let authUser: ExternalUser;

  try {
    const provider = new AuthMastodon(query.domain);
    mastodonToken = await provider.getToken(query.code);
    authUser = await provider.getUser(mastodonToken);

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

  const currentUser =
    (await userGet(undefined, authUser.account)) ||
    (await userCreate(authUser.account));

  await userUpdate(currentUser, {
    avatarUrl: authUser.avatarUrl,
    displayName: authUser.displayName,
    lastSignedInAt: new Date()
  });

  const liveToken = await userToken.getToken(currentUser);

  ctx.body = {
    mastodonToken,
    liveToken
  };
};
