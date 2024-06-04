import { Encoder } from '../services/encoder';
import { kickoffClient } from '../services/srs-api';

export const sessions = new Map<
  number,
  {
    clientId: string;
    encoder: Encoder;
    internalToken: string;
    heartbeatInterval?: NodeJS.Timeout;
  }
>();

export const lives = new Map<
  number,
  {
    isRecording: boolean;
    recordingSeconds: number;
    lastRecordStartAt?: number;
  }
>();

export const isServerIdling = () => {
  console.log('sessions', sessions.size, 'lives', lives.size);
  return sessions.size === 0 && lives.size === 0;
};

export const rejectSession = async (liveId: number) => {
  const session = sessions.get(liveId);
  if (!session) {
    console.warn('session not found', liveId);
    return;
  }

  try {
    void session.encoder.cleanup();
  } catch (e) {
    console.warn('cleanup error', liveId, e);
  }

  if (session.heartbeatInterval) {
    clearInterval(session.heartbeatInterval);
  }

  try {
    await kickoffClient(session.clientId);
  } catch (e) {
    console.warn('kickoff client failed', e);
  }

  return session;
};
