import crypto from 'crypto';
import { Image, Live, LivePrivacy, PrismaClient } from '@prisma/client';
import { images, lives, tenants } from '.';
import { LiveConfig, LivePrivate, LivePublic } from 'api-types/common/types';

export const Lives = (client: PrismaClient['live']) =>
  Object.assign(client, {
    getPublic: (
      live: Live & {
        thumbnail?: Image | null;
      }
    ): LivePublic => ({
      id: live.id,
      idInTenant: live.idInTenant,
      userId: live.userId,
      tenantId: live.tenantId,
      startedAt: live.startedAt || undefined,
      endedAt: live.endedAt || undefined,
      title: live.title,
      description: live.description || undefined,
      privacy: live.privacy,
      sensitive: live.sensitive,
      hashtag: live.hashtag || undefined,
      watchingSumCount: live.watchingSumCount || undefined,
      isPushing: !live.pushLastEndedAt && !!live.pushLastStartedAt,
      thumbnail: live.thumbnail ? images.getPublic(live.thumbnail) : undefined
    }),
    getPrivate: (
      live: Live & {
        thumbnail?: Image | null;
      }
    ): LivePrivate => ({
      ...lives.getPublic(live),
      config: lives.getConfig(live)
    }),
    getConfig: (live: Live): Required<LiveConfig> => {
      const config = (live.config || {}) as LiveConfig;

      return {
        preferThumbnailType: config.preferThumbnailType ?? 'generate'
      };
    },
    get: async (id: number) => {
      const live = await client.findUnique({
        where: {
          id
        },
        include: {
          thumbnail: true
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
        },
        include: {
          thumbnail: true
        }
      });

      return live || undefined;
    },
    getPublicAndAlive: async (tenantId?: number) => {
      const lives = await client.findMany({
        where: {
          endedAt: null,
          startedAt: {
            not: null
          },
          tenantId: tenantId || undefined,
          privacy: {
            not: LivePrivacy.Private
          }
        },
        orderBy: {
          startedAt: 'desc'
        },
        include: {
          tenant: true,
          thumbnail: true
        },
        take: 10
      });

      return lives.filter(
        live => tenants.getConfig(live.tenant).exploreInOtherTenants
      );
    },
    isAccessibleInformationByUser: (live: Live, userId?: number) => {
      // live owner
      if (live.userId === userId) {
        return true;
      } else {
        if (!live.startedAt) {
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
    isAccessibleStreamByUser: (live: Live, userId?: number) => {
      const isAccessibleInformation = lives.isAccessibleInformationByUser(
        live,
        userId
      );
      if (!isAccessibleInformation) {
        return false;
      }

      return live.pushLastStartedAt && !live.pushLastEndedAt;
    },
    createLive: async (
      tenantId: number,
      userId: number,
      title: string,
      privacy: LivePrivacy,
      description?: string,
      hashtag?: string,
      config: LiveConfig = {},
      thumbnailId?: number
    ) => {
      const watchToken = crypto.randomBytes(48).toString('hex');
      const lastLive = await client.findFirst({
        where: {
          tenantId
        },
        orderBy: {
          idInTenant: 'desc'
        }
      });

      return await client.create({
        data: {
          idInTenant: lastLive ? lastLive.idInTenant + 1 : 1,
          tenantId,
          userId,
          title,
          description,
          privacy,
          hashtag,
          watchToken,
          config,
          thumbnailId
        }
      });
    },
    getAliveAll: async () => {
      const lives = await client.findMany({
        where: {
          endedAt: null
        }
      });

      return lives;
    },
    startStream: async (live: Live) => {
      if (live.endedAt) {
        throw new Error('Live is not ready');
      }

      const data = await client.update({
        where: {
          id: live.id
        },
        data: {
          pushFirstStartedAt: live.pushFirstStartedAt || new Date(),
          pushLastEndedAt: null,
          pushLastStartedAt: new Date()
        }
      });

      return data;
    },
    stopStream: async (live: Live) => {
      if (live.endedAt && live.pushLastEndedAt) {
        throw new Error('Live is not live');
      }

      const data = await client.update({
        where: {
          id: live.id
        },
        data: {
          pushLastEndedAt: new Date()
        }
      });

      return data;
    },
    startLive: async (live: Live) => {
      const data = await client.update({
        where: {
          id: live.id
        },
        data: {
          startedAt: new Date()
        }
      });

      return data;
    },
    endLive: async (live: Live, watchingSumCount: number) => {
      const data = await client.update({
        where: {
          id: live.id
        },
        data: {
          endedAt: new Date(),
          watchingSumCount
        }
      });

      return data;
    }
  });
