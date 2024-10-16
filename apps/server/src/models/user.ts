import type { PrismaClient, User } from '@prisma/client';
import { UserConfig, UserPrivate, UserPublic } from 'api-types/common/types';
import isValidDomain from 'is-valid-domain';
import { users } from '.';
import { USERNAME_REGEX } from '../utils/constants';

export const Users = (prismaUser: PrismaClient['user']) =>
  Object.assign(prismaUser, {
    getPublic: (user: User): UserPublic => ({
      id: user.id,
      account: user.account,
      displayName: user.displayName || undefined,
      avatarUrl: user.avatarUrl || undefined,
      url: user.url || getFallbackUrl(user.account)
    }),
    getPrivate: (user: User): UserPrivate => ({
      ...users.getPublic(user),
      config: users.getConfig(user)
    }),
    getConfig: (user: User): Required<UserConfig> => {
      const config = (user.config || {}) as UserConfig;

      return {
        allowUnstableFeatures: config.allowUnstableFeatures ?? false
      };
    },
    createAccount: async (account: string) => {
      const acct = account.toLowerCase();

      const [username, domain] = acct.split('@');
      if (!USERNAME_REGEX.test(username || '')) {
        throw new Error('Invalid username');
      }
      if (!isValidDomain(domain || '')) {
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
      if (!id && !account) {
        return undefined;
      }

      const user = await prismaUser.findUnique({
        where: {
          id,
          account
        }
      });

      return user || undefined;
    },
    updateUser: async (
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
    },
    getOrCreateForRemote: async (
      account: string,
      displayName?: string,
      avatarUrl?: string
    ) => {
      account = account.toLowerCase();

      const user = await prismaUser.findUnique({
        where: {
          account
        }
      });

      if (user) {
        const updatedUser = await prismaUser.update({
          where: { id: user.id },
          data: {
            displayName,
            avatarUrl
          }
        });

        return updatedUser;
      }

      const newUser = await prismaUser.create({
        data: {
          displayName,
          avatarUrl,
          account,
          config: {}
        }
      });

      return newUser;
    }
  });

const getFallbackUrl = (acct: string) => {
  const [username, domain] = acct.split('@');

  return `https://${domain}/@${username}`;
};
