import {
  Live,
  LiveStatus,
  LivePrivacy,
  StreamStatus,
  PrismaClient
} from '@prisma/client';
import { prisma } from './_client';

export { LiveStatus, LivePrivacy, StreamStatus };

export type LivePublic = {
  id: number;
  idInTenant: number;
  userId: number;
  tenantId: number;
  startedAt?: Date;
  endedAt?: Date;
  title: string;
  description?: string;
  status: LiveStatus;
};

export const Lives = (client: PrismaClient['live']) =>
  Object.assign(client, {
    getPublic: (live: Live): LivePublic => ({
      id: live.id,
      idInTenant: live.idInTenant,
      userId: live.userId,
      tenantId: live.tenantId,
      startedAt: live.startedAt || undefined,
      endedAt: live.endedAt || undefined,
      title: live.title,
      description: live.description || undefined,
      status: live.status
    }),
    get: async (id: number) => {
      const live = await client.findUnique({
        where: {
          id
        }
      });

      return live || undefined;
    },
    getByTenantLiveId: async (tenantId: number, liveIdInTenant: number) => {
      const live = await client.findUnique({
        where: {
          idInTenant_tenantId: {
            tenantId,
            idInTenant: liveIdInTenant
          }
        }
      });

      return live || undefined;
    },
    getPublicAndAlive: async (tenantId?: number) => {
      const lives = await client.findMany({
        where: {
          status: LiveStatus.Live,
          endedAt: null,
          startedAt: {
            not: null
          },
          tenantId: tenantId || undefined
        },
        orderBy: {
          startedAt: 'desc'
        },
        take: 10
      });

      return lives;
    },
    createLive: async (
      tenantId: number,
      userId: number,
      title: string,
      privacy: LivePrivacy,
      description?: string,
      hashtag?: string
    ) => {
      const live = await prisma.$transaction(async prisma => {
        const stream = await prisma.stream.create({
          data: {
            status: StreamStatus.Provisioning
          }
        });

        const lastLive = await prisma.live.findFirst({
          where: {
            tenantId
          },
          orderBy: {
            idInTenant: 'desc'
          }
        });

        return await prisma.live.create({
          data: {
            idInTenant: lastLive ? lastLive.idInTenant + 1 : 1,
            streamId: stream.id,
            tenantId,
            userId,
            title,
            description,
            privacy,
            hashtag,
            status: LiveStatus.Provisioning
          }
        });
      });

      return live;
    }
  });
