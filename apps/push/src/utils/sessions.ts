import { Encoder } from '../services/encoder';
import { kickoffClient } from '../services/srs-api';

export const sessions = new Map<
  number,
  {
    clientId: string;
    encoder: Encoder;
    internalToken: string;
  }
>();

export const rejectSession = async (liveId: number) => {
  const session = sessions.get(liveId);
  if (!session) {
    console.warn('session not found', liveId);
    return;
  }

  try {
    await session.encoder.cleanup();
  } catch (e) {
    console.warn('cleanup error', liveId, e);
  }

  try {
    await kickoffClient(session.clientId);
  } catch (e) {
    console.warn('kickoff client failed', e);
  }

  sessions.delete(liveId);
};
