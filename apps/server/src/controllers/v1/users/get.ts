import { Methods } from 'api-types/api/v1/users/_userId@number';
import { users } from '../../../models';
import type { APIRoute } from '../../../utils/types';

export type Response = Methods['get']['resBody'];

export const getV1UsersOnce: APIRoute<
  'userId',
  never,
  never,
  Response
> = async ctx => {
  const userId = parseInt(ctx.params.userId, 10);
  if (!userId || isNaN(userId) || userId <= 0) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'user_not_found'
    };
    return;
  }

  const user = await users.get(userId);
  if (!user) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'user_not_found'
    };
    return;
  }

  ctx.body = users.getPublic(user);
};
