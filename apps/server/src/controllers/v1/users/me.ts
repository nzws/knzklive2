import { Methods } from 'api-types/api/v1/users/me';
import { users } from '../../../models';
import type { APIRoute, UserState } from '../../../utils/types';

export type Response = Methods['get']['resBody'];

export const getV1UsersMe: APIRoute<
  never,
  never,
  never,
  Response,
  UserState
> = ctx => {
  ctx.body = users.getPrivate(ctx.state.user);
};
