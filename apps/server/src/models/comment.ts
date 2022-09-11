import type { Comment, PrismaClient } from '@prisma/client';
import { comments } from '.';
import { pubsub } from '../redis/pubsub/client';
import { getCommentKey } from '../redis/pubsub/keys';

export type CommentPublic = {
  id: number;
  liveId: number;
  userId: number;
  createdAt: Date;
  content: string;
  sourceUrl?: string;
  isDeleted: boolean;
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
        sourceUrl: comment.sourceUrl || undefined,
        isDeleted: comment.isDeleted
      };
    },
    createViaLocal: async (userId: number, liveId: number, content: string) => {
      const data = await client.create({
        data: {
          liveId,
          userId,
          content
        }
      });

      const result = comments.getPublic(data);
      await pubsub.publish(getCommentKey(liveId), JSON.stringify(result));

      return result;
    },
    createViaRemote: async (
      userId: number,
      liveId: number,
      content: string,
      sourceUrl: string,
      sourceId: string
    ) => {
      const data = await client.create({
        data: {
          liveId,
          userId,
          content,
          sourceUrl,
          sourceId
        }
      });
      const result = comments.getPublic(data);
      await pubsub.publish(getCommentKey(liveId), JSON.stringify(result));

      return result;
    },
    markAsDelete: async (commentId: number) => {
      const updated = await client.update({
        data: {
          isDeleted: true
        },
        where: {
          id: commentId
        }
      });

      await pubsub.publish(
        getCommentKey(updated.liveId),
        JSON.stringify({
          id: updated.id,
          isDeleted: true
        })
      );
    },
    markAsDeleteBySourceId: async (sourceId: string) => {
      await client.updateMany({
        data: {
          isDeleted: true
        },
        where: {
          sourceId
        }
      });
      // todo: publish
    }
  });
