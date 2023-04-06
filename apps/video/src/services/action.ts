import { mkdir, rm, stat } from 'fs/promises';
import { client, serverToken } from '../utils/api';
import { download } from './downloader';
import { Encoder, getDirectory } from './encoder';
import { sessions } from '../utils/sessions';
import { getDirectorySize, getQuotaFreeSize } from './file-io';

export class Action {
  static async publishRecording(
    liveId: number,
    watchToken: string,
    originalMp4Url: string,
    originalBytes: string
  ) {
    try {
      void client.v1.internals.video.signal.$post({
        body: {
          liveId,
          action: 'record:processing',
          serverToken
        }
      });

      await mkdir(`/home/node/recordings`, { recursive: true });
      const path = `/home/node/recordings/${liveId}_${watchToken}.mp4`;
      await download(originalMp4Url, path);
      const { size } = await stat(path, { bigint: true });
      if (size.toString() !== originalBytes) {
        console.warn({
          expected: originalBytes,
          actual: size.toString()
        });
        throw new Error('downloaded file size mismatch');
      }

      const encoder = new Encoder(path, liveId, watchToken);
      sessions.set(liveId, {
        encoder
      });

      await encoder.encodeToHqHls();

      try {
        await rm(path);
      } catch (e) {
        console.warn(e);
      }

      const currentCacheSize = await getDirectorySize(
        getDirectory(liveId, watchToken)
      );

      void client.v1.internals.video.signal.$post({
        body: {
          liveId,
          action: 'record:done',
          serverToken,
          cacheSize: currentCacheSize.toString()
        }
      });

      void Action.checkQuota();
    } catch (e) {
      console.warn(e);

      void client.v1.internals.video.signal.$post({
        body: {
          liveId,
          action: 'record:failed',
          serverToken
        }
      });
    } finally {
      sessions.delete(liveId);
    }
  }

  static async checkQuota() {
    try {
      console.log('checkQuota start');
      const free = await getQuotaFreeSize();

      if (free > BigInt(0)) {
        console.log('checkQuota: not exceeded');
        return;
      }

      const { outdatedLives } =
        await client.v1.internals.video.check_outdated.$post({
          body: {
            serverToken,
            exceededSize: free.toString()
          }
        });
      console.log('checkQuota: outdatedLives', outdatedLives);

      for (const live of outdatedLives) {
        void Action.unpublishRecording(live.liveId, live.watchToken);
      }
    } catch (e) {
      console.warn('checkQuota failed', e);
    }
  }

  static async unpublishRecording(liveId: number, watchToken: string) {
    try {
      const encoder = sessions.get(liveId)?.encoder;
      if (encoder) {
        encoder.killAll();
        sessions.delete(liveId);
      }

      await rm(getDirectory(liveId, watchToken), { recursive: true });

      void client.v1.internals.video.signal.$post({
        body: {
          liveId,
          action: 'record:deleted',
          serverToken
        }
      });
    } catch (e) {
      console.warn(e);

      void client.v1.internals.video.signal.$post({
        body: {
          liveId,
          action: 'record:failed',
          serverToken
        }
      });
    } finally {
      sessions.delete(liveId);
    }
  }
}
