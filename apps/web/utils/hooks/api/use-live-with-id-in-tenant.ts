import useAspidaSWR from '@aspida/swr';
import { LivePublic } from '~/../server/src/models/live';
import { client } from '~/utils/api/client';

export const useLiveWithIdInTenant = (
  domain: string,
  id: string,
  fallbackData?: LivePublic
) => {
  const { data } = useAspidaSWR(
    client.v1.lives.find._tenantDomain(domain)._idInTenant(parseInt(id, 10)),
    {
      fallbackData
    }
  );

  return [data];
};
