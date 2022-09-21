import { Methods } from 'api-types/api/v1/lives/_liveId@number/comments';
import { CommentPublic } from 'api-types/common/types';
import { comments, lives } from '../../../models';
import { jwtCommentViewer } from '../../../services/jwt';
import { APIRoute } from '../../../utils/types';

type Query = Methods['get']['query'];
type Response = Methods['get']['resBody'];

export const getV1LivesComment: APIRoute<
  'liveId',
  Query,
  never,
  Response
> = async ctx => {
  const liveId = parseInt(ctx.params.liveId || '', 10);
  if (!liveId || isNaN(liveId) || liveId <= 0) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'live_not_found'
    };
    return;
  }

  const live = await lives.get(liveId);
  if (!live) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'live_not_found'
    };
    return;
  }

  if (typeof ctx.query.viewerToken === 'string') {
    const verify = await jwtCommentViewer.verifyToken(
      ctx.query.viewerToken,
      live.id
    );

    if (!verify) {
      ctx.status = 403;
      ctx.body = {
        errorCode: 'forbidden_live'
      };
      return;
    }
  } else {
    if (
      !lives.isAccessibleInformationByUser(live, ctx.state.userId as number)
    ) {
      ctx.status = 403;
      ctx.body = {
        errorCode: 'forbidden_live'
      };
      return;
    }
  }

  const items = await comments.findMany({
    where: {
      liveId: live.id
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
