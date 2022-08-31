import type { Comment, PrismaClient } from '@prisma/client';

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
    }
  });
