import type { Comment, PrismaClient } from '@prisma/client';
import { CommentPublic } from 'api-types/common/types';
import {
  LiveUpdateCommentCreated,
  LiveUpdateCommentDeleted
} from 'api-types/streaming/live-update';
import { comments } from '.';
import { pubsub } from '../services/redis/pubsub/client';
import { getLiveUpdateKey } from '../services/redis/pubsub/keys';

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
    getComments: async (liveId: number, lastCommentId = 0) => {
      const comments = await client.findMany({
        where: {
          liveId,
          id: {
            gt: lastCommentId
          }
        },
        orderBy: {
          id: 'desc'
        },
        take: 100
      });

      return comments;
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
      await pubsub.publish(
        getLiveUpdateKey(liveId),
        JSON.stringify({
          type: 'comment:created',
          data: [result]
        } as LiveUpdateCommentCreated)
      );

      return result;
    },
    createViaRemote: async (
      userId: number,
      liveId: number,
      content: string,
      sourceUrl: string,
      sourceId: string
    ) => {
      if (content.length > 100) {
        content = content.slice(0, 100) + '...';
      }

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
      await pubsub.publish(
        getLiveUpdateKey(liveId),
        JSON.stringify({
          type: 'comment:created',
          data: [result]
        } as LiveUpdateCommentCreated)
      );

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
        getLiveUpdateKey(updated.liveId),
        JSON.stringify({
          type: 'comment:deleted',
          data: {
            id: updated.id
          }
        } as LiveUpdateCommentDeleted)
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
