import { JSONSchemaType } from 'ajv';
import { AuthMastodon } from 'services/auth-providers/mastodon';
import { prisma } from 'utils/prisma';
import { APIRoute } from 'utils/types';
import { validate } from 'utils/validate';

export type Params = {
  domain: string;
  code: string;
};

export type Response = {
  mastodonToken: string;
  liveJwt: string;
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
  const token = await provider.getToken(query.code);
  const authUser = await provider.getUser(token);
  if (!authUser.account) {
    ctx.throw(400, 'Failed to get user');
    return;
  }

  const liveUser = await prisma.user.upsert({
    where: {
      account: authUser.account
    },
    update: {
      account: authUser.account,
      displayName: authUser.displayName,
      avatarUrl: authUser.avatarUrl
    },
    create: {
      account: authUser.account,
      displayName: authUser.displayName,
      avatarUrl: authUser.avatarUrl,
      config: {}
    }
  });
};
