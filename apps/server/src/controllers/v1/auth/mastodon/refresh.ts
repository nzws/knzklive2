import type { JSONSchemaType } from 'ajv';
import type { Methods } from 'api-types/api/v1/auth/mastodon/refresh';
import { users } from '../../../../models';
import { UserToken } from '../../../../redis/user-token';
import { AuthMastodon } from '../../../../services/auth-providers/mastodon';
import type { ExternalUser } from '../../../../services/auth-providers/_base';
import type { APIRoute } from '../../../../utils/types';
import { validateWithType } from '../../../../utils/validate';

type Params = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

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
  if (!validateWithType(schema, ctx.request.body)) {
    ctx.code = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }
  const query = ctx.request.body;

  let authUser: ExternalUser;

  try {
    const provider = new AuthMastodon(query.domain);
    authUser = await provider.getUser(query.token);

    if (!authUser.account) {
      ctx.code = 500;
      ctx.body = {
        errorCode: 'internal_server_error'
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

  await users.updateUser(currentUser, {
    avatarUrl: authUser.avatarUrl,
    displayName: authUser.displayName,
    lastSignedInAt: new Date()
  });

  const liveToken = await userToken.create(currentUser.id);

  ctx.body = {
    liveToken
  };
};
