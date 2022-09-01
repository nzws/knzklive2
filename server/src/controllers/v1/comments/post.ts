import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/comments/_liveId@number/index';
import { comments, lives } from '../../../models';
import { APIRoute, UserState } from '../../../utils/types';
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

export const postV1Comment: APIRoute<
  'liveId',
  never,
  Request,
  Response,
  UserState
> = async ctx => {
  const { liveId } = ctx.params;
  if (!validateWithType(reqBodySchema, ctx.request.body)) {
    ctx.code = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }
  const content = ctx.request.body.content;

  if (content.trim().length <= 0) {
    ctx.code = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const live = await lives.get(parseInt(liveId, 10));
  if (!live) {
    ctx.code = 404;
    ctx.body = {
      errorCode: 'not_found'
    };
    return;
  }

  const comment = await comments.createViaLocal(
    ctx.state.user.id,
    live.id,
    content
  );
  const result = comments.getPublic(comment);
  if (!result) {
    ctx.code = 500;
    ctx.body = {
      errorCode: 'internal_server_error'
    };
    return;
  }

  ctx.body = result;
};
