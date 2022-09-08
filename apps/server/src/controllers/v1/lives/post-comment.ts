import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/lives/_liveId@number/comments';
import { comments } from '../../../models';
import { pubsub } from '../../../redis/pubsub/client';
import { getCommentKey } from '../../../redis/pubsub/keys';
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

  const comment = await comments.createViaLocal(
    ctx.state.user.id,
    ctx.state.live.id,
    content
  );

  const result = comments.getPublic(comment);
  await pubsub.publish(
    getCommentKey(ctx.state.live.id),
    JSON.stringify(result)
  );

  if (!result) {
    ctx.code = 500;
    ctx.body = {
      errorCode: 'internal_server_error'
    };
    return;
  }

  ctx.body = result;
};
