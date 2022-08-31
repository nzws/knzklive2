import { prisma } from './_client';
import { Users } from './user';
import { Tenants } from './tenant';
import { AuthProviders } from './auth-provider';
import { Lives } from './live';
import { Comments } from './comment';

export { prisma };
export const users = Users(prisma.user);
export const tenants = Tenants(prisma.tenant);
export const authProviders = AuthProviders(prisma.authProvider);
export const lives = Lives(prisma.live);
export const comments = Comments(prisma.comment);
