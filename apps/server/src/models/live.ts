import crypto from 'crypto';
import { Image, Live, LivePrivacy, PrismaClient, Tenant } from '@prisma/client';
import { images, liveStreamProgresses, lives, tenants } from '.';
import { LiveConfig, LivePrivate, LivePublic } from 'api-types/common/types';
import {
  basePushStream,
  frontendUrl,
  getPublicLiveUrl,
  serverToken
} from '../utils/constants';
import { webhookQueue } from '../services/queues/webhook';
import { pushApi } from '../services/push-api';
import { thumbnailStorage } from '../services/storage/thumbnail';
import { jwtWebInternalAPI } from '../services/jwt';
import { RelationCache } from '../services/redis/relation-cache';

export const Lives = (client: PrismaClient['live']) =>
  Object.assign(client, {
    getPublic: (
      live: Live & {
        thumbnail?: Image | null;
        tenant: Tenant;
      }
    ): LivePublic => {
      const config = lives.getConfig(live);

      return {
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
        isPushing: live.isPushing,
        publicUrl: getPublicLiveUrl(live.tenant.slug, live.idInTenant),
        tenant: tenants.getPublic(live.tenant),
        thumbnail: live.thumbnail
          ? images.getPublic(live.thumbnail)
          : undefined,
        isRequiredFollowing: config.isRequiredFollowing,
        isRequiredFollower: config.isRequiredFollower,
        isRecording: live.isRecording
      };
    },
    getPrivate: (
      live: Live & {
        thumbnail?: Image | null;
        tenant: Tenant;
      }
    ): LivePrivate => ({
      ...lives.getPublic(live),
      isRecording: live.isRecording,
      config: lives.getConfig(live)
    }),
    getConfig: (live: Live): Required<LiveConfig> => {
      const config = (live.config || {}) as LiveConfig;

      return {
        preferThumbnailType: config.preferThumbnailType ?? 'generate',
        isRequiredFollowing: config.isRequiredFollowing ?? false,
        isRequiredFollower: config.isRequiredFollower ?? false
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
    getPublicAndAlive: async (take = 10, page = 1) => {
      const lives = await client.findMany({
        where: {
          endedAt: null,
          startedAt: {
            not: null
          },
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
        take,
        skip: (page - 1) * take
      });

      return lives.filter(
        live => tenants.getConfig(live.tenant).exploreInOtherTenants
      );
    },
    getList: async (tenantId: number, take = 10, page = 1) => {
      const lives = await client.findMany({
        where: {
          startedAt: {
            not: null
          },
          tenantId: tenantId
        },
        orderBy: {
          startedAt: 'desc'
        },
        include: {
          thumbnail: true
        },
        take,
        skip: (page - 1) * take
      });

      return lives;
    },
    // 配信の何かしらの情報を確認可能か？
    isAccessibleInformationByUser: async (live: Live, userId?: number) => {
      const config = lives.getConfig(live);

      if (live.isDeleted) {
        return false;
      }

      // live owner
      if (live.userId === userId) {
        return true;
      } else {
        if (!live.startedAt) {
          return false;
        }
      }

      /*
      todo: admin が確認できる
      if (userId === admin) {
        return true;
      }
      */

      // public live
      if (live.privacy === LivePrivacy.Public) {
        return true;
      }

      // private live
      if (live.privacy === LivePrivacy.Private) {
        if (!userId) {
          return false;
        }

        // FFによる制御
        if (config.isRequiredFollower || config.isRequiredFollowing) {
          const relation = await new RelationCache(live.userId).get(userId);
          if (!relation) {
            return false;
          }

          // 配信者は視聴者をフォローしてほしい
          if (config.isRequiredFollower && !relation.follower) {
            return false;
          }

          // 視聴者は配信者をフォローしてほしい
          if (config.isRequiredFollowing && !relation.following) {
            return false;
          }
        }

        return true;
      }

      return false;
    },
    // 生配信を視聴可能か？
    isAccessibleStreamByUser: async (live: Live, userId?: number) => {
      const isAccessibleInformation = await lives.isAccessibleInformationByUser(
        live,
        userId
      );
      if (!isAccessibleInformation) {
        return false;
      }

      return live.isPushing;
    },
    createLive: async (
      tenantId: number,
      userId: number,
      title: string,
      privacy: LivePrivacy,
      isRecording: boolean,
      description?: string,
      hashtag?: string,
      config: LiveConfig = {},
      thumbnailId?: number
    ) => {
      const watchToken = crypto.randomBytes(48).toString('hex');
      const pushToken = crypto.randomBytes(48).toString('hex');
      const lastLive = await client.findFirst({
        where: {
          tenantId
        },
        orderBy: {
          idInTenant: 'desc'
        }
      });

      if (lastLive && !lastLive.endedAt) {
        throw new LiveNotEndedError();
      }

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
          pushToken,
          config,
          thumbnailId,
          isRecording
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
          isPushing: true
        },
        include: {
          thumbnail: true,
          tenant: true
        }
      });

      await liveStreamProgresses.start(live.id);

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
      if (live.endedAt && !live.isPushing) {
        throw new Error('Live is not live');
      }

      const data = await client.update({
        where: {
          id: live.id
        },
        data: {
          isPushing: false
        },
        include: {
          thumbnail: true,
          tenant: true
        }
      });

      await liveStreamProgresses.stop(live.id);

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

      // todo: locale バックエンドが持ってるわけではないので Next.js API 側で絞る？？(URLにしてもそう)
      const paths = [
        `/app/ja/tenants/${data.tenant.slug}/${data.idInTenant}`,
        `/app/en/tenants/${data.tenant.slug}/${data.idInTenant}`
      ];
      const revalidateData = {
        paths
      };

      await webhookQueue.add('system:web:revalidate', {
        url: `${frontendUrl}/api/revalidate`,
        postBody: {
          data: revalidateData,
          signature: await jwtWebInternalAPI.generateToken(
            JSON.stringify(revalidateData)
          )
        }
      });

      await webhookQueue.add('system:push:action', {
        url: pushApi(basePushStream).api.externals.v1.action.$path(),
        postBody: {
          liveId: live.id,
          serverToken,
          action: 'start',
          isRecording: live.isRecording
        },
        timeout: 1000 * 60
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
    },
    regeneratePushToken: async (live: Live) => {
      const pushToken = crypto.randomBytes(48).toString('hex');

      await client.update({
        where: {
          id: live.id
        },
        data: {
          pushToken
        }
      });

      return pushToken;
    }
  });

export class LiveNotEndedError extends Error {
  constructor() {
    super('Live is not ended');
  }
}
