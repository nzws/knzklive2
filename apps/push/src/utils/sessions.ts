import { kickoffClient } from '../services/srs-api';

export const sessions = new Map<
  number,
  {
    clientId: string;
  }
>();

export const rejectSession = async (liveId: number) => {
  const session = sessions.get(liveId);
  if (!session) {
    console.warn('session not found', liveId);
    return;
  }

  try {
    await kickoffClient(session.clientId);
  } catch (e) {
    console.warn('kickoff client failed', e);
  }

  sessions.delete(liveId);
};
