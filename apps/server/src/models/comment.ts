import type { Comment, Live, PrismaClient } from '@prisma/client';
import { users } from '.';

export type CommentPublic = {
  id: number;
  liveId: number;
  userId: number;
  createdAt: Date;
  content: string;
  sourceUrl?: string;
};

export const Comments = (client: PrismaClient['comment']) =>
  Object.assign(client, {
    getPublic: (comment: Comment): CommentPublic | undefined => {
      if (comment.isDeleted) {
        return undefined;
      }

      return {
        id: comment.id,
        liveId: comment.liveId,
        userId: comment.userId,
        createdAt: comment.createdAt,
        content: comment.content,
        sourceUrl: comment.sourceUrl || undefined
      };
    },
    createViaLocal: async (userId: number, liveId: number, content: string) => {
      return client.create({
        data: {
          liveId,
          userId,
          content
        }
      });
    },
    createViaRemote: async (
      account: string,
      live: Live,
      content: string,
      sourceUrl: string
    ) => {
      const user = await users.getOrCreateForRemote(account);

      return client.create({
        data: {
          liveId: live.id,
          userId: user.id,
          content,
          sourceUrl
        }
      });
    }
  });
