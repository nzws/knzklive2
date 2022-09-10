import useAspidaSWR from '@aspida/swr';
import { client } from '~/utils/api/client';

export const useLiveTop = (tenantId?: number) => {
  const { data } = useAspidaSWR(
    client.v1.lives.find._tenantId(tenantId || 0).top,
    {
      key: tenantId ? undefined : null
    }
  );

  return [data];
};
