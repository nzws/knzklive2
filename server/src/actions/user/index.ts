import { User } from '@prisma/client';
import isValidDomain from 'is-valid-domain';
import { USERNAME_REGEX } from 'utils/constants';
import { prisma } from 'utils/prisma';

type UserConfig = {
  //
};

export const userCreate = async (account: string): Promise<User> => {
  const acct = account.toLowerCase();

  const [username, domain] = acct.split('@');
  if (!USERNAME_REGEX.test(username)) {
    throw new Error('Invalid username');
  }
  if (!isValidDomain(domain)) {
    throw new Error('Invalid domain');
  }

  const user = await prisma.user.create({
    data: {
      account: acct,
      config: {}
    }
  });

  return user;
};

export const userGet = async (
  id?: number,
  account?: string
): Promise<User | undefined> => {
  if (account) {
    account = account.toLowerCase();
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
      account
    }
  });

  return user || undefined;
};

export const userUpdate = async (
  user: User,
  data: Partial<
    Pick<User, 'avatarUrl' | 'displayName' | 'lastSignedInAt'> & {
      config: UserConfig;
    }
  >
): Promise<User> => {
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data
  });

  return updatedUser;
};
