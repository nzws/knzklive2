import { Methods } from 'api-types/api/v1/lives/_liveId@number/comments';
import { CommentPublic } from 'api-types/common/types';
import { comments } from '../../../models';
import { APIRoute, LiveState } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1LivesComment: APIRoute<
  never,
  never,
  never,
  Response,
  LiveState
> = async ctx => {
  const items = await comments.findMany({
    where: {
      liveId: ctx.state.live.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  });

  const result = items
    .map(comments.getPublic)
    .filter(v => v) as CommentPublic[];

  ctx.body = result;
};
