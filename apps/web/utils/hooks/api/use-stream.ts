import useAspidaSWR from '@aspida/swr';
import { client } from '~/utils/api/client';
import { useAuth } from '../use-auth';

export const useStream = (liveId?: number) => {
  const { token } = useAuth();
  const { data, mutate } = useAspidaSWR(
    client.v1.streams._liveId(liveId || 0),
    {
      headers: {
        Authorization: `Bearer ${token || ''}`
      },
      key: token && liveId ? undefined : null,
      refreshInterval: 5000,
      refreshWhenHidden: true
    }
  );

  return [data, mutate] as const;
};
