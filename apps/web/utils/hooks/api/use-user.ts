import useAspidaSWR from '@aspida/swr';
import { client } from '~/utils/api/client';

export const useUser = (userId?: number) => {
  const { data: user } = useAspidaSWR(client.v1.users._userId(userId || 0), {
    key: userId ? undefined : null
  });

  return [user];
};
