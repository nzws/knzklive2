import useAspidaSWR from '@aspida/swr';
import { client } from '~/utils/api/client';
import { useAuth } from '../use-auth';
import { useAPIError } from './use-api-error';

export const useVideo = (liveId: number) => {
  const { headers } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error, mutate } = useAspidaSWR(
    client.v1.videos._liveId(liveId),
    {
      key: liveId ? undefined : null,
      headers,
      revalidateOnFocus: false,
      revalidateIfStale: false
    }
  );
  useAPIError(error);

  return [data, mutate] as const;
};
