import { PrismaClient } from '@prisma/client';
import { liveStreamProgresses } from '.';

export const LiveStreamProgress = (
  client: PrismaClient['liveStreamProgress']
) =>
  Object.assign(client, {
    start: async (liveId: number) => {
      const last = await liveStreamProgresses.getLast(liveId);
      if (last && !last.endedAt) {
        return;
      }

      await client.create({
        data: {
          liveId,
          startedAt: new Date()
        }
      });
    },
    stop: async (liveId: number) => {
      const last = await liveStreamProgresses.getLast(liveId);
      if (!last || last.endedAt) {
        return;
      }

      await client.update({
        where: {
          id: last.id
        },
        data: {
          endedAt: new Date()
        }
      });
    },
    getLast: async (liveId: number) => {
      const last = await client.findFirst({
        where: {
          liveId
        },
        orderBy: {
          startedAt: 'desc'
        }
      });

      return last;
    },
    getList: async (liveId: number) => {
      const list = await client.findMany({
        where: {
          liveId
        },
        orderBy: {
          startedAt: 'asc'
        }
      });

      return list;
    }
  });
