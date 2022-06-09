import type { JSONSchemaType } from 'ajv';
import { users } from '../../../../models';
import { AuthMastodon } from '../../../../services/auth-providers/mastodon';
import type { ExternalUser } from '../../../../services/auth-providers/_base';
import type { APIRoute } from '../../../../utils/types';
import { validateWithType } from '../../../../utils/validate';
import type { Methods } from 'api-types/api/v1/auth/mastodon/token';
import { UserToken } from '../../../../redis/user-token';

type Params = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

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
  const query = ctx.request.body as unknown;
  if (!validateWithType(schema, query)) {
    ctx.status = 400;
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
      ctx.status = 500;
      ctx.body = {
        errorCode: 'internal_server_error'
      };
      return;
    }
  } catch (e) {
    console.warn(e);

    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_response_from_provider'
    };
    return;
  }

  const currentUser =
    (await users.get(undefined, authUser.account)) ||
    (await users.createAccount(authUser.account));

  await users.updateUser(currentUser, {
    avatarUrl: authUser.avatarUrl,
    displayName: authUser.displayName,
    lastSignedInAt: new Date()
  });

  const liveToken = await userToken.create(currentUser.id);

  ctx.body = {
    mastodonToken,
    liveToken
  };
};
