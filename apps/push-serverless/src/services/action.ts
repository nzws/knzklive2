import { lives, rejectSession, sessions } from '../utils/sessions';
import { Encoder } from './encoder';
import { generateToken } from '../utils/token';

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
      void encoder.encodeToLowQualityHls();
      void encoder.encodeToAudio();

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
