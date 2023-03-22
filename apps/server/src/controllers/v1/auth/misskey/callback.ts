import type { JSONSchemaType } from 'ajv';
import type { Methods } from 'api-types/api/v1/auth/misskey/callback';
import type { APIRoute } from '../../../../utils/types';
import { validateWithType } from '../../../../utils/validate';

type Params = Methods['get']['query'];

const schema: JSONSchemaType<Params> = {
  type: 'object',
  properties: {
    session: {
      type: 'string',
      minLength: 1
    }
  },
  required: ['session'],
  additionalProperties: false
};

export const v1AuthMisskeyCallback: APIRoute<never, Params> = ctx => {
  const query = ctx.request.query;
  if (!validateWithType(schema, query)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const host = process.env.FRONTEND_ENDPOINT || '';

  ctx.redirect(`${host}/auth/callback?code=${query.session}`);
};
