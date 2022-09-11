import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/lives/_liveId@number/comments';
import { comments } from '../../../models';
import { APIRoute, LiveState, UserState } from '../../../utils/types';
import { validateWithType } from '../../../utils/validate';

type Request = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    content: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    }
  },
  required: ['content'],
  additionalProperties: false
};

export const postV1LivesComment: APIRoute<
  never,
  never,
  Request,
  Response,
  UserState & LiveState
> = async ctx => {
  if (!validateWithType(reqBodySchema, ctx.request.body)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const content = ctx.request.body.content;

  if (content.trim().length <= 0) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const result = await comments.createViaLocal(
    ctx.state.user.id,
    ctx.state.live.id,
    content
  );

  if (!result) {
    ctx.status = 500;
    ctx.body = {
      errorCode: 'internal_server_error'
    };
    return;
  }

  ctx.body = result;
};
