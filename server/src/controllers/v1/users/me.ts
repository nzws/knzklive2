import { User } from '@prisma/client';
import { userGet } from 'actions/user';
import { APIRouteWithAuth } from 'utils/types';

export type Response = User;

export const getV1UsersMe: APIRouteWithAuth<
  never,
  never,
  never,
  Response
> = async ctx => {
  const user = ctx.state.user;

  const data = await userGet(user.id);

  if (!data) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'user_not_found'
    };
    return;
  }

  ctx.body = data;
};
