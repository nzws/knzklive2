import { AuthProviderType, PrismaClient } from '@prisma/client';

export const AuthProviders = (
  prismaAuthProvider: PrismaClient['authProvider']
) =>
  Object.assign(prismaAuthProvider, {
    createClient: async (
      domain: string,
      clientId: string,
      clientSecret: string
    ) => {
      await prismaAuthProvider.create({
        data: {
          domain,
          type: AuthProviderType.Mastodon,
          clientId,
          clientSecret
        }
      });
    },
    get: async (domain: string) => {
      const authProvider = await prismaAuthProvider.findUnique({
        where: {
          domain
        }
      });

      return authProvider || undefined;
    }
  });
