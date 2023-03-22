import type { JSONSchemaType } from 'ajv';
import { users } from '../../../../models';
import type { ExternalUser } from '../../../../services/auth-providers/_base';
import type { APIRoute } from '../../../../utils/types';
import { validateWithType } from '../../../../utils/validate';
import type { Methods } from 'api-types/api/v1/auth/misskey/token';
import { UserToken } from '../../../../services/redis/user-token';
import { AuthMisskey } from '../../../../services/auth-providers/misskey';

type Params = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

const schema: JSONSchemaType<Params> = {
  type: 'object',
  properties: {
    session: {
      type: 'string',
      minLength: 1
    },
    domain: {
      type: 'string',
      minLength: 1
    }
  },
  required: ['session', 'domain'],
  additionalProperties: false
};

const userToken = new UserToken();

export const v1AuthMisskeyToken: APIRoute<
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

  let misskeyToken: string;
  let authUser: ExternalUser;

  try {
    const provider = new AuthMisskey(query.domain);
    misskeyToken = await provider.getToken(query.session);
    authUser = await provider.getUser(misskeyToken);

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
    misskeyToken,
    liveToken
  };
};
