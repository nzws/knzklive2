import type { User } from '@prisma/client';
import type { APIRoute, UserState } from '../../../utils/types';

export type Response = User;

export const getV1UsersMe: APIRoute<
  never,
  never,
  never,
  Response,
  UserState
> = ctx => {
  ctx.body = ctx.state.user;
};
