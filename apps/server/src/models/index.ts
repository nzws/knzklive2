import { prisma } from './_client';
import { Users } from './user';
import { Tenants } from './tenant';
import { AuthProviders } from './auth-provider';
import { Lives } from './live';
import { Comments } from './comment';
import { Images } from './image';
import { Invites } from './invite';
import { CommentAutoMods } from './comment-auto-mod';
import { LiveStreamProgress } from './live-stream-progress';
import { LiveRecordings } from './live-recording';

export { prisma };
export const users = Users(prisma.user);
export const tenants = Tenants(prisma.tenant);
export const authProviders = AuthProviders(prisma.authProvider);
export const lives = Lives(prisma.live);
export const comments = Comments(prisma.comment);
export const images = Images(prisma.image);
export const invites = Invites(prisma.invite);
export const commentAutoMods = CommentAutoMods(prisma.commentAutoMod);
export const liveStreamProgresses = LiveStreamProgress(
  prisma.liveStreamProgress
);
export const liveRecordings = LiveRecordings(prisma.liveRecording);
