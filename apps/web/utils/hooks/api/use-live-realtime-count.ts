import useAspidaSWR from '@aspida/swr';
import { client } from '~/utils/api/client';
import { useAuth } from '../use-auth';

export const useLiveRealtimeCount = (liveId?: number) => {
  const { headers } = useAuth();
  const { data } = useAspidaSWR(client.v1.lives._liveId(liveId || 0).count, {
    key: liveId ? undefined : null,
    refreshInterval: 10000,
    headers
  });

  return [data] as const;
};
