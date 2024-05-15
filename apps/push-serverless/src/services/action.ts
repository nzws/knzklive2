import { lives, rejectSession, sessions } from '../utils/sessions';
import { Encoder } from './encoder';
import { generateToken } from '../utils/token';
import { client, serverToken } from '../utils/api';

const RECORDING_MAX_SECONDS = 60 * 60; // 1 hour

export class Action {
  static async startStream(
    liveId: number,
    watchToken: string,
    clientId: string
  ) {
    const currentSession = sessions.get(liveId);
    if (currentSession) {
      await rejectSession(liveId);
      sessions.delete(liveId);
    }

    const internalToken = generateToken();
    const encoder = new Encoder(liveId, watchToken, internalToken);

    sessions.set(liveId, {
      clientId,
      encoder,
      internalToken
    });

    setTimeout(() => {
      void encoder.encodeToHighQualityHls();
      // fixme: パフォーマンス足りない
      // void encoder.encodeToLowQualityHls();
      // void encoder.encodeToAudio();

      // this.startRecording(liveId);
    }, 500);
  }

  static async stopStream(liveId: number) {
    await rejectSession(liveId);
    sessions.delete(liveId);

    const live = lives.get(liveId);
    if (live?.lastRecordStartAt) {
      const diff = Math.floor((Date.now() - live.lastRecordStartAt) / 1000);
      lives.set(liveId, {
        ...live,
        recordingSeconds: live.recordingSeconds + diff,
        lastRecordStartAt: undefined
      });
    }
  }

  static startLive(liveId: number, isRecording: boolean) {
    lives.set(liveId, {
      isRecording: isRecording,
      recordingSeconds: 0
    });

    if (isRecording) {
      // this.startRecording(liveId);
    }
  }

  static async endLive(liveId: number) {
    const session = await rejectSession(liveId);
    if (!session) {
      lives.delete(liveId);
      return;
    }

    void (async () => {
      try {
        const live = lives.get(liveId);
        if (!live?.isRecording) {
          lives.delete(liveId);
          sessions.delete(liveId);
          return;
        }

        void client.v1.internals.push.action.$post({
          body: {
            liveId,
            action: 'record:processing',
            serverToken
          }
        });

        // 録画データの生成を待つ
        await session.encoder.cleanup();

        throw new Error('Not implemented');

        /*

        const path = await session.encoder.mergeRecording();
        if (!path) {
          throw new Error('merge recording failed');
        }
        const { size } = await stat(path, { bigint: true });
        const { key } = await new VideoStorageClient().putMp4(liveId, path);
        await session.encoder.cleanupMergedRecording();

        void client.v1.internals.push.action.$post({
          body: {
            liveId,
            action: 'record:done',
            serverToken,
            recordingKey: key,
            fileSize: size.toString()
          }
        });
        */
      } catch (e) {
        console.warn('merge recording failed', e);

        void client.v1.internals.push.action.$post({
          body: {
            liveId,
            action: 'record:failed',
            serverToken
          }
        });
      } finally {
        sessions.delete(liveId);
        lives.delete(liveId);
      }
    })();
  }

  private static startRecording(liveId: number) {
    const prev = lives.get(liveId);
    if (!prev?.isRecording) {
      return;
    }
    if (prev && prev?.recordingSeconds >= RECORDING_MAX_SECONDS) {
      console.warn('recording max seconds reached', liveId);
      return;
    }

    const encoder = sessions.get(liveId)?.encoder;
    const recordingSeconds = prev?.recordingSeconds ?? 0;
    const remainingSeconds = RECORDING_MAX_SECONDS - recordingSeconds;
    void encoder?.encodeToRecording(remainingSeconds);

    if (!prev?.lastRecordStartAt) {
      lives.set(liveId, {
        isRecording: true,
        recordingSeconds,
        lastRecordStartAt: Date.now()
      });
    }
  }
}
