import { userCreate, userGet, userUpdate } from 'actions/user';
import { JSONSchemaType } from 'ajv';
import { AuthMastodon } from 'services/auth-providers/mastodon';
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
  Params,
  never,
  Response
> = async ctx => {
  const query = ctx.request.query;
  const { valid } = validate<Params>(schema, query);
  if (!valid) {
    ctx.throw(400, 'Invalid request');
    return;
  }

  const provider = new AuthMastodon(query.domain);
  const mastodonToken = await provider.getToken(query.code);
  const authUser = await provider.getUser(mastodonToken);
  if (!authUser.account) {
    ctx.throw(400, 'Failed to get user');
    return;
  }

  const currentUser =
    (await userGet(undefined, authUser.account)) ||
    (await userCreate(authUser.account));

  await userUpdate(currentUser, {
    avatarUrl: authUser.avatarUrl,
    displayName: authUser.displayName
  });

  const liveToken = await userToken.getToken(currentUser);

  ctx.body = {
    mastodonToken,
    liveToken
  };
};
