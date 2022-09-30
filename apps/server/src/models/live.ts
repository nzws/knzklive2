import crypto from 'crypto';
import { Image, Live, LivePrivacy, PrismaClient, Tenant } from '@prisma/client';
import { images, lives, tenants } from '.';
import { LiveConfig, LivePrivate, LivePublic } from 'api-types/common/types';
import {
  basePushStream,
  getPublicLiveUrl,
  serverToken
} from '../utils/constants';
import { webhookQueue } from '../services/queues/webhook';
import { pushApi } from '../services/push-api';
import { thumbnailStorage } from '../services/storage/thumbnail';

export const Lives = (client: PrismaClient['live']) =>
  Object.assign(client, {
    getPublic: (
      live: Live & {
        thumbnail?: Image | null;
        tenant: Tenant;
      }
    ): LivePublic => ({
      id: live.id,
      idInTenant: live.idInTenant,
      userId: live.userId,
      startedAt: live.startedAt || undefined,
      endedAt: live.endedAt || undefined,
      title: live.title,
      description: live.description || undefined,
      privacy: live.privacy,
      sensitive: live.sensitive,
      hashtag: live.hashtag || undefined,
      watchingSumCount: live.watchingSumCount || undefined,
      isPushing: !live.pushLastEndedAt && !!live.pushLastStartedAt,
      publicUrl: getPublicLiveUrl(live.tenant.slug, live.idInTenant),
      tenant: tenants.getPublic(live.tenant),
      thumbnail: live.thumbnail ? images.getPublic(live.thumbnail) : undefined
    }),
    getPrivate: (
      live: Live & {
        thumbnail?: Image | null;
        tenant: Tenant;
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
          thumbnail: true,
          tenant: true
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
          thumbnail: true,
          tenant: true
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
        },
        include: {
          thumbnail: true,
          tenant: true
        }
      });
    },
    getAliveAll: async () => {
      const lives = await client.findMany({
        where: {
          endedAt: null
        },
        include: {
          thumbnail: true,
          tenant: true
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
        },
        include: {
          thumbnail: true,
          tenant: true
        }
      });

      const { key, url } = await thumbnailStorage.getUploadUrlFromPushServer(
        live.tenantId,
        live.id
      );

      await webhookQueue.add(
        'system:push:thumbnail',
        {
          url: pushApi(basePushStream).api.externals.v1.thumbnail.$path(),
          postBody: {
            liveId: live.id,
            serverToken,
            signedUploadUrl: url
          },
          data: {
            storageKey: key
          },
          timeout: 1000 * 60
        },
        {
          delay: 3000
        }
      );

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
        },
        include: {
          thumbnail: true,
          tenant: true
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
        },
        include: {
          thumbnail: true,
          tenant: true
        }
      });

      const webhookUrl = tenants.getConfig(data.tenant).webhookUrl;
      if (data.privacy === 'Public' && webhookUrl) {
        await webhookQueue.add('user:live:started', {
          url: webhookUrl,
          postBody: {
            type: 'live:started',
            live: lives.getPublic(data)
          }
        });
      }

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
        },
        include: {
          thumbnail: true,
          tenant: true
        }
      });

      await webhookQueue.add('system:push:action', {
        url: pushApi(basePushStream).api.externals.v1.action.$path(),
        postBody: {
          liveId: live.id,
          serverToken,
          action: 'end'
        },
        timeout: 1000 * 60
      });

      return data;
    }
  });
