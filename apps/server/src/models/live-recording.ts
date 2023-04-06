import { LiveRecordingStatus, PrismaClient } from '@prisma/client';
import { lives } from '.';
import { LiveLastWatchedAt } from '../services/redis/live-last-watched-at';

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
      url?: string,
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
            originalUrl: url,
            originalSize: size
          }
        });
      } else {
        return client.create({
          data: {
            id: liveId,
            originalStatus: status,
            originalUrl: url,
            originalSize: size
          }
        });
      }
    },
    getOutdatedLives: async (exceededSize: bigint) => {
      const live = await lives.findMany({
        where: {
          isRecording: true,
          recording: {
            cacheStatus: LiveRecordingStatus.Completed,
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
            cacheCompletedAt: 'asc'
          }
        },
        take: 100
      });

      const watchedAtCache = new LiveLastWatchedAt();
      const watchedAtList = await Promise.all(
        live.map(async x => ({
          live: x,
          watchedAt: await watchedAtCache.get(x.id)
        }))
      );

      const outdatedLives = watchedAtList.sort((a, b) => {
        if (!a.watchedAt) {
          return -1;
        }

        if (!b.watchedAt) {
          return 1;
        }

        return a.watchedAt.getTime() - b.watchedAt.getTime();
      });

      let totalSize = 0n;
      const removingLives = [];

      for (const live of outdatedLives) {
        const recording = live.live.recording;
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

      return removingLives.map(x => x.live);
    }
  });
