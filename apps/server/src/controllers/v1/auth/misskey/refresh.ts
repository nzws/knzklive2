import type { JSONSchemaType } from 'ajv';
import type { Methods } from 'api-types/api/v1/auth/misskey/refresh';
import { users } from '../../../../models';
import { UserToken } from '../../../../services/redis/user-token';
import type { ExternalUser } from '../../../../services/auth-providers/_base';
import type { APIRoute } from '../../../../utils/types';
import { validateWithType } from '../../../../utils/validate';
import { AuthMisskey } from '../../../../services/auth-providers/misskey';

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

export const v1AuthMisskeyRefresh: APIRoute<
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

  let authUser: ExternalUser;

  try {
    const provider = new AuthMisskey(query.domain);
    authUser = await provider.getUser(query.token);

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

  const currentUser = await users.get(undefined, authUser.account);
  if (!currentUser) {
    ctx.status = 403;
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
