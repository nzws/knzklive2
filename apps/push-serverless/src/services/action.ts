import { lives, rejectSession, sessions } from '../utils/sessions';
import { Encoder } from './encoder';
import { generateToken } from '../utils/token';
import { client, serverToken } from '../utils/api';
import { getStream } from './srs-api';

export class Action {
  static async startStream(
    liveId: number,
    watchToken: string,
    clientId: string,
    streamId: string
  ) {
    const currentSession = sessions.get(liveId);
    if (currentSession) {
      await rejectSession(liveId);
      sessions.delete(liveId);
    }

    const internalToken = generateToken();
    const encoder = new Encoder(liveId, watchToken, internalToken);

    const sendHeartbeat = async () => {
      const streamInfo = await getStream(streamId);
      const stats = streamInfo?.stream;
      if (!stats) {
        console.warn('stream not found', streamId, liveId);
        return;
      }

      void client.v1.internals.push.action.$post({
        body: {
          liveId,
          action: 'stream:heartbeat',
          serverToken,
          stats: stats
        }
      });
    };

    const heartbeatInterval = setInterval(
      () => void sendHeartbeat(),
      1000 * 15
    );

    sessions.set(liveId, {
      clientId,
      encoder,
      internalToken,
      heartbeatInterval
    });

    setTimeout(() => {
      void encoder.encodeToHighQualityHls();
      void encoder.encodeToLowQualityHls();
      void encoder.encodeToAudio();

      void sendHeartbeat();

      // this.startRecording(liveId);
    }, 500);
  }

  static async stopStream(liveId: number) {
    await rejectSession(liveId);
    sessions.delete(liveId);
  }

  static startLive(liveId: number, isRecording: boolean) {
    lives.set(liveId, {
      isRecording: isRecording,
      recordingSeconds: 0
    });
  }

  static async endLive(liveId: number) {
    const session = await rejectSession(liveId);
    if (!session) {
      lives.delete(liveId);
      return;
    }
    lives.delete(liveId);
    sessions.delete(liveId);
  }
}
