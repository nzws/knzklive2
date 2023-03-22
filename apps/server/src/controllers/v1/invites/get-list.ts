import { Methods } from 'api-types/api/v1/invites';
import { invites } from '../../../models';
import { APIRoute, UserState } from '../../../utils/types';

type Response = Methods['get']['resBody'];

export const getV1InvitesGetList: APIRoute<
  never,
  never,
  never,
  Response,
  UserState
> = async ctx => {
  const list = await invites.getList(ctx.state.user.id);
  const publicList = list.map(invites.getPublic);

  ctx.body = publicList;
};
