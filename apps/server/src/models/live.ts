import {
  Live,
  LiveStatus,
  LivePrivacy,
  StreamStatus,
  PrismaClient
} from '@prisma/client';
import { prisma } from './_client';

export type LivePublic = {
  id: number;
  idInTenant: number;
  userId: number;
  tenantId: number;
  startedAt?: Date;
  endedAt?: Date;
  title: string;
  description?: string;
  sensitive: boolean;
  status: 'Provisioning' | 'Ready' | 'Live' | 'Ended';
  privacy: 'Public' | 'Private';
  hashtag?: string;
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
      status: live.status,
      privacy: live.privacy,
      sensitive: live.sensitive,
      hashtag: live.hashtag || undefined
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
    isAccessibleInformationByUser: (live: Live, userId?: number) => {
      // live owner
      if (live.userId === userId) {
        return true;
      } else {
        if (
          live.status === LiveStatus.Provisioning ||
          live.status === LiveStatus.Ready
        ) {
          return false;
        }
      }

      // public live
      if (live.privacy === LivePrivacy.Public) {
        return true;
      }

      // private live
      if (live.privacy === LivePrivacy.Private) {
        if (!userId) {
          return false;
        }

        // todo: FF限定とかの機能
        return true;
      }

      return false;
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
            status: StreamStatus.Ready
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
            status: LiveStatus.Ready
          }
        });
      });

      return live;
    }
  });
