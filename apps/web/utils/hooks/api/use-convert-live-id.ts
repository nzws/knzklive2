import useAspidaSWR from '@aspida/swr';
import { useEffect } from 'react';
import { LivePublic } from '~/../server/src/models/live';
import { client } from '~/utils/api/client';
import { useAuth } from '../use-auth';
import { useAPIError } from './use-api-error';

export const useConvertLiveId = (
  domain: string,
  liveIdInTenant: string,
  fallbackData?: LivePublic
) => {
  const { headers } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error, mutate } = useAspidaSWR(
    client.v1.lives.find
      ._tenantDomain(domain)
      ._idInTenant(parseInt(liveIdInTenant, 10)),
    {
      fallbackData,
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
