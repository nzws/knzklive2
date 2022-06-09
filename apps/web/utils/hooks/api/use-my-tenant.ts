import useAspidaSWR from '@aspida/swr';
import { client } from '~/utils/api/client';
import { useAuth } from '../use-auth';

export const useMyTenants = () => {
  const { token } = useAuth();
  const { data } = useAspidaSWR(client.v1.tenants, {
    headers: {
      Authorization: `Bearer ${token || ''}`
    },
    key: token ? undefined : null
  });

  return [data];
};
