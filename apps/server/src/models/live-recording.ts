import {
  Live,
  LiveRecording,
  LiveRecordingStatus,
  PrismaClient
} from '@prisma/client';
import { lives } from '.';
import { VideoWatchingLogCache } from '../services/redis/video-watching-log-cache';

export const LiveRecordings = (client: PrismaClient['liveRecording']) =>
  Object.assign(client, {
    get: async (liveId: number) => {
      const liveRecording = await client.findUnique({
        where: {
          id: liveId
        }
      });

      return liveRecording;
    },
    createOrUpdateOriginalStatus: async (
      liveId: number,
      status: LiveRecordingStatus,
      storageKey?: string,
      size?: bigint
    ) => {
      const liveRecording = await client.findUnique({
        where: {
          id: liveId
        }
      });

      if (liveRecording) {
        return client.update({
          where: {
            id: liveId
          },
          data: {
            originalStatus: status,
            originalKey: storageKey,
            originalSize: size,
            originalCompletedAt:
              status === LiveRecordingStatus.Completed ? new Date() : undefined
          }
        });
      } else {
        return client.create({
          data: {
            id: liveId,
            originalStatus: status,
            originalKey: storageKey,
            originalSize: size,
            originalCompletedAt:
              status === LiveRecordingStatus.Completed ? new Date() : undefined
          }
        });
      }
    },
    getOutdatedLives: async (exceededSize: bigint) => {
      const live = await lives.findMany({
        where: {
          isRecording: true,
          recording: {
            cacheHqStatus: LiveRecordingStatus.Completed,
            cacheCompletedAt: {
              // 7日以上前に生成したキャッシュを対象とする
              lt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
            }
          }
        },
        include: {
          recording: true
        },
        orderBy: {
          recording: {
            watchCountUpdatedAt: 'asc',
            watchCount: 'asc'
          }
        },
        take: 100
      });

      const outdatedLives = (await Promise.all(
        live.map(async x => {
          const watchingLogCache = new VideoWatchingLogCache(x.id);
          const todayCount = await watchingLogCache.getActiveCount();

          if (todayCount !== 0) {
            return null;
          }

          return x;
        })
      ).then(x => x.filter(x => x))) as (Live & { recording: LiveRecording })[];

      let totalSize = 0n;
      const removingLives = [];

      for (const live of outdatedLives) {
        const recording = live.recording;
        if (!recording) {
          continue;
        }

        const size = recording.cacheSize;
        if (!size) {
          continue;
        }

        totalSize += size;
        removingLives.push(live);

        if (totalSize >= exceededSize) {
          break;
        }
      }

      return removingLives;
    },
    async incrementCount(liveId: number, increment: number) {
      await client.update({
        where: {
          id: liveId
        },
        data: {
          watchCount: {
            increment
          },
          watchCountUpdatedAt: new Date()
        }
      });
    }
  });
