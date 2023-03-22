import useAspidaSWR from '@aspida/swr';
import { client } from '~/utils/api/client';
import { useAuth } from '../use-auth';

export const useMyInviteCodes = () => {
  const { token } = useAuth();
  const { data, mutate } = useAspidaSWR(client.v1.invites, {
    headers: {
      Authorization: `Bearer ${token || ''}`
    },
    key: token ? undefined : null
  });

  return [data, mutate] as const;
};
