import useAspidaSWR from '@aspida/swr';
import { client } from '~/utils/api/client';
import { useAuth } from '../use-auth';

export const useUsersMe = () => {
  const { token } = useAuth();
  const { data: user } = useAspidaSWR(client.v1.users.me, {
    headers: {
      Authorization: `Bearer ${token || ''}`
    },
    key: token ? undefined : null
  });

  return [user];
};
