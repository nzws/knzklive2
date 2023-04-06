import useAspidaSWR from '@aspida/swr';
import { LivePublic } from 'api-types/common/types';
import { client } from '~/utils/api/client';
import { useAuth } from '../use-auth';
import { useAPIError } from './use-api-error';
import { useEffect, useState } from 'react';

export const useLive = (liveId?: number, fallbackData?: LivePublic) => {
  const { headers } = useAuth();
  const [isLiveEnded, setIsLiveEnded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error, mutate } = useAspidaSWR(
    client.v1.lives._liveId(liveId || 0),
    {
      fallbackData,
      key: liveId ? undefined : null,
      refreshInterval: isLiveEnded ? undefined : 10000,
      headers
    }
  );
  useAPIError(error);

  useEffect(() => {
    setIsLiveEnded(!!data?.endedAt ?? false);
  }, [data?.endedAt]);

  return [data, mutate] as const;
};
