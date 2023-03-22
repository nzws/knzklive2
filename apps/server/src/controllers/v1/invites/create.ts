import { Methods } from 'api-types/api/v1/invites';
import { invites } from '../../../models';
import {
  InviteDisabledError,
  NoTenantError,
  TooManyInvitesError
} from '../../../models/invite';
import { APIRoute, UserState } from '../../../utils/types';

type Response = Methods['post']['resBody'];

export const postV1Invites: APIRoute<
  never,
  never,
  never,
  Response,
  UserState
> = async ctx => {
  try {
    const invite = await invites.createInvite(ctx.state.user);

    ctx.body = {
      invite: invites.getPublic(invite)
    };
  } catch (e) {
    if (e instanceof TooManyInvitesError) {
      ctx.status = 400;
      ctx.body = {
        errorCode: 'invalid_request',
        message: '招待コードは5個まで発行できます。'
      };
      return;
    }

    if (e instanceof NoTenantError) {
      ctx.status = 400;
      ctx.body = {
        errorCode: 'invalid_request',
        message: '招待コードを作成するには、既に配信者である必要があります。'
      };
      return;
    }

    if (e instanceof InviteDisabledError) {
      ctx.status = 400;
      ctx.body = {
        errorCode: 'invalid_request',
        message: '招待コードの新規作成は現在管理者が無効にしています。'
      };
      return;
    }

    throw e;
  }
};
