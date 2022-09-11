import useAspidaSWR from '@aspida/swr';
import { client } from '~/utils/api/client';
import { useAuth } from '../use-auth';

export const useStreamStatus = (tenantId?: number) => {
  const { token } = useAuth();
  const { data } = useAspidaSWR(
    client.v1.tenants._tenantId(tenantId || 0).stream_status,
    {
      headers: {
        Authorization: `Bearer ${token || ''}`
      },
      key: token && tenantId ? undefined : null
    }
  );

  return [data];
};
