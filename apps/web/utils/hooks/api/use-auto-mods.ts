import useAspidaSWR from '@aspida/swr';
import { client } from '~/utils/api/client';
import { useAuth } from '../use-auth';

export const useAutoMods = (tenantId: number) => {
  const { token } = useAuth();
  const { data, mutate } = useAspidaSWR(
    client.v1.tenants._tenantId(tenantId).auto_mod,
    {
      headers: {
        Authorization: `Bearer ${token || ''}`
      },
      key: token ? undefined : null
    }
  );

  return [data, mutate] as const;
};
