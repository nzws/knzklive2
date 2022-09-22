import { Methods } from 'api-types/api/v1/lives/_liveId@number/comments';
import { comments } from '../../../models';
import { APIRoute, LiveState, UserState } from '../../../utils/types';

type Request = Methods['delete']['query'];
type Response = Methods['delete']['resBody'];

export const deleteV1LivesComment: APIRoute<
  never,
  Request,
  never,
  Response,
  UserState & LiveState
> = async ctx => {
  const commentId = parseInt(ctx.query.commentId as string, 10);
  if (!commentId || isNaN(commentId) || commentId <= 0) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'not_found'
    };
    return;
  }

  const comment = await comments.findUnique({
    where: {
      id: commentId
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

  await comments.markAsDelete(commentId);

  ctx.body = { success: true };
};
