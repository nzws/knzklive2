import type { PrismaClient, User } from '@prisma/client';
import { USERNAME_REGEX } from '../utils/constants';
import { checkDomain } from '../utils/domain';

export type UserConfig = {
  //
};

export type UserPrivate = User;

export const Users = (prismaUser: PrismaClient['user']) =>
  Object.assign(prismaUser, {
    create: async (account: string) => {
      const acct = account.toLowerCase();

      const [username, domain] = acct.split('@');
      if (!USERNAME_REGEX.test(username || '')) {
        throw new Error('Invalid username');
      }
      if (!checkDomain(domain || '')) {
        throw new Error('Invalid domain');
      }

      const user = await prismaUser.create({
        data: {
          account: acct,
          config: {}
        }
      });

      return user;
    },
    get: async (id?: number, account?: string) => {
      if (account) {
        account = account.toLowerCase();
      }

      const user = await prismaUser.findUnique({
        where: {
          id,
          account
        }
      });

      return user || undefined;
    },
    update: async (
      user: User,
      data: Partial<
        Pick<User, 'avatarUrl' | 'displayName' | 'lastSignedInAt'> & {
          config: UserConfig;
        }
      >
    ) => {
      const updatedUser = await prismaUser.update({
        where: { id: user.id },
        data
      });

      return updatedUser;
    }
  });
