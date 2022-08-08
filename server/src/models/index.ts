import { prisma } from './_client';
import { Users } from './user';
import { Tenants } from './tenant';
import { AuthProviders } from './auth-provider';

export { prisma };
export const users = Users(prisma.user);
export const tenants = Tenants(prisma.tenant);
export const authProviders = AuthProviders(prisma.authProvider);
