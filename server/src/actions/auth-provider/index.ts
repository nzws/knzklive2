import { AuthProvider, AuthProviderType } from '@prisma/client';
import { prisma } from 'utils/prisma';

export const authProviderCreate = async (
  domain: string,
  clientId: string,
  clientSecret: string
): Promise<void> => {
  await prisma.authProvider.create({
    data: {
      domain,
      type: AuthProviderType.Mastodon,
      clientId,
      clientSecret
    }
  });
};

export const authProviderGet = async (
  domain: string
): Promise<AuthProvider | undefined> => {
  const authProvider = await prisma.authProvider.findUnique({
    where: {
      domain
    }
  });

  return authProvider || undefined;
};
