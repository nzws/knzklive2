import useAspidaSWR from '@aspida/swr';
import { LivePublic } from 'api-types/common/types';
import { client } from '~/utils/api/client';
import { useAuth } from '../use-auth';
import { useAPIError } from './use-api-error';

export const useLive = (liveId?: number, fallbackData?: LivePublic) => {
  const { headers } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error, mutate } = useAspidaSWR(
    client.v1.lives._liveId(liveId || 0),
    {
      fallbackData,
      key: liveId ? undefined : null,
      refreshInterval: 10000,
      headers
    }
  );
  useAPIError(error);

  return [data, mutate] as const;
};
