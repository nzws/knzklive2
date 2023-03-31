import useAspidaSWR from '@aspida/swr';
import { useEffect } from 'react';
import { client } from '~/utils/api/client';
import { useAuth } from '../use-auth';
import { useAPIError } from './use-api-error';

export const useConvertLiveId = (slug: string, liveIdInTenant: string) => {
  const { headers } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error, mutate } = useAspidaSWR(
    client.v1.lives.find._slug(slug)._idInTenant(parseInt(liveIdInTenant, 10)),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      headers
    }
  );
  useAPIError(error);
  const liveId = data?.id;

  useEffect(() => {
    if (headers) {
      void mutate();
    }
  }, [headers, mutate]);

  return [liveId];
};
