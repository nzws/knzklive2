import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/lives/_liveId@number/comments';
import { comments } from '../../../models';
import { APIRoute, LiveState, UserState } from '../../../utils/types';
import { validateWithType } from '../../../utils/validate';

type Request = Methods['delete']['reqBody'];
type Response = Methods['delete']['resBody'];

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
      minLength: 1
    }
  },
  required: ['id'],
  additionalProperties: false
};

export const deleteV1LivesComment: APIRoute<
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

  const comment = await comments.findUnique({
    where: {
      id: ctx.request.body.id
    }
  });
  if (!comment || comment.liveId !== ctx.state.live.id) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'not_found'
    };
    return;
  }

  if (
    ctx.state.user.id !== ctx.state.live.userId &&
    comment.userId !== ctx.state.user.id
  ) {
    ctx.status = 403;
    ctx.body = {
      errorCode: 'forbidden',
      message: 'コメントは配信者かコメントしたユーザーのみ削除できます'
    };
    return;
  }

  await comments.markAsDelete(ctx.request.body.id);

  ctx.body = { success: true };
};
