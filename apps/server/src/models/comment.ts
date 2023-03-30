import type { Comment, Live, PrismaClient, User } from '@prisma/client';
import { CommentPublic } from 'api-types/common/types';
import {
  LiveUpdateCommentCreated,
  LiveUpdateCommentDeleted,
  LiveUpdateCommentHidden
} from 'api-types/streaming/live-update';
import { comments, lives, users } from '.';
import { AutoModService } from '../services/automod';
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
        isDeleted: comment.isDeleted,
        isHidden: comment.isHidden
      };
    },
    getComments: async (liveId: number, lastCommentId = 0) => {
      const comments = await client.findMany({
        where: {
          liveId,
          id: {
            gt: lastCommentId
          },
          isDeleted: false,
          isHidden: false
        },
        orderBy: {
          id: 'desc'
        },
        take: 100
      });

      return comments;
    },
    createViaLocal: async (user: User, live: Live, content: string) => {
      const autoMod = new AutoModService(live.tenantId);

      const data = await client.create({
        data: {
          liveId: live.id,
          userId: user.id,
          content,
          isHidden: await autoMod.shouldHidden(
            user.account,
            user.displayName || undefined,
            content
          )
        }
      });

      const result = comments.getPublic(data);
      await pubsub.publish(
        getLiveUpdateKey(live.id),
        JSON.stringify({
          type: 'comment:created',
          data: [result]
        } as LiveUpdateCommentCreated)
      );

      return result;
    },
    createViaRemote: async (
      user: User,
      liveId: number,
      content: string,
      sourceUrl: string,
      sourceId: string
    ) => {
      if (content.length > 100) {
        content = content.slice(0, 100) + '...';
      }

      const live = await lives.get(liveId);

      if (!live?.tenantId) {
        throw new Error('Live not found');
      }

      const autoMod = new AutoModService(live.tenantId);

      const data = await client.create({
        data: {
          liveId,
          userId: user.id,
          content,
          sourceUrl,
          sourceId,
          isHidden: await autoMod.shouldHidden(
            user.account,
            user.displayName || undefined,
            content
          )
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
    markAsHidden: async (commentId: number) => {
      const updated = await client.update({
        data: {
          isHidden: true
        },
        where: {
          id: commentId
        }
      });

      await pubsub.publish(
        getLiveUpdateKey(updated.liveId),
        JSON.stringify({
          type: 'comment:hidden',
          data: {
            id: updated.id
          }
        } as LiveUpdateCommentHidden)
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
    },
    applyAutoMod: async (tenantId: number, liveId: number) => {
      const items = await comments.getComments(liveId);
      const autoMod = new AutoModService(tenantId);

      const accountIds = Array.from(new Set(items.map(item => item.userId)));
      console.log(accountIds);
      const accounts = (
        await Promise.all(accountIds.map(id => users.get(id)))
      ).filter(item => item !== undefined) as User[];

      const autoModResults = await Promise.all(
        items.map(item => {
          const account = accounts.find(({ id }) => id === item.userId);
          return autoMod.shouldHidden(
            account?.account,
            account?.displayName || undefined,
            item.content
          );
        })
      );

      const results = items.filter((_, index) => autoModResults[index]);
      await Promise.all(results.map(item => comments.markAsHidden(item.id)));
    }
  });
