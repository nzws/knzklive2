import type { Invite, PrismaClient, User } from '@prisma/client';
import crypto from 'crypto';
import { InvitePublic } from 'api-types/common/types';
import { invites, tenants } from '.';

export const Invites = (prismaInvite: PrismaClient['invite']) =>
  Object.assign(prismaInvite, {
    get: async (inviteId: string): Promise<Invite | undefined> => {
      return (
        (await prismaInvite.findUnique({
          where: {
            inviteId
          }
        })) || undefined
      );
    },
    getPublic: (invite: Invite): InvitePublic => ({
      inviteId: invite.inviteId,
      createdBy: invite.createdById || undefined,
      usedBy: invite.usedById || undefined
    }),
    getList: async (userId: number): Promise<Invite[]> => {
      return await prismaInvite.findMany({
        where: {
          createdById: userId
        }
      });
    },
    createInvite: async (user: User): Promise<Invite> => {
      if (!process.env.ALLOW_ANONYMOUS_INVITE) {
        throw new InviteDisabledError();
      }

      const currentTenants = await tenants.getByOwnerId(user.id);
      if (currentTenants.length <= 0) {
        throw new NoTenantError();
      }

      const current = await invites.getList(user.id);
      if (current.length >= 5) {
        throw new TooManyInvitesError();
      }

      const inviteId = crypto.randomUUID();

      const invite = await prismaInvite.create({
        data: {
          inviteId,
          createdById: user.id
        }
      });

      return invite;
    },
    createInviteByAdmin: async (): Promise<Invite> => {
      const inviteId = crypto.randomUUID();

      const invite = await prismaInvite.create({
        data: {
          inviteId
        }
      });

      return invite;
    }
  });

export class TooManyInvitesError extends Error {
  constructor() {
    super('Too many invites');
  }
}

export class NoTenantError extends Error {
  constructor() {
    super('Invite user must have a tenant');
  }
}

export class InviteDisabledError extends Error {
  constructor() {
    super('Invites are disabled');
  }
}
