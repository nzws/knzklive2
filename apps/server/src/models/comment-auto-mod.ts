import type {
  CommentAutoMod,
  CommentAutoModType,
  PrismaClient
} from '@prisma/client';
import { CommentAutoModPrivate } from 'api-types/common/types';
import { CommentAutoModCache } from '../services/redis/comment-auto-mod';

export const CommentAutoMods = (client: PrismaClient['commentAutoMod']) =>
  Object.assign(client, {
    getPrivate: (data: CommentAutoMod): CommentAutoModPrivate => ({
      id: data.id,
      type: data.type,
      value: data.value
    }),
    getList: async (tenantId: number) => {
      return await client.findMany({
        where: {
          tenantId
        },
        orderBy: {
          id: 'desc'
        }
      });
    },
    remove: async (tenantId: number, id: number) => {
      const data = await client.findUnique({
        where: {
          id
        }
      });
      if (!data || data.tenantId !== tenantId) {
        throw new CommentAutoModNotFoundError();
      }

      await client.delete({
        where: {
          id
        }
      });

      await new CommentAutoModCache(tenantId).updateCache();
    },
    createItem: async (
      tenantId: number,
      type: CommentAutoModType,
      value: string
    ) => {
      const data = await client.create({
        data: {
          tenantId,
          type,
          value
        }
      });

      await new CommentAutoModCache(tenantId).updateCache();

      return data;
    }
  });

export class CommentAutoModNotFoundError extends Error {
  constructor() {
    super('CommentAutoMod not found');
  }
}
