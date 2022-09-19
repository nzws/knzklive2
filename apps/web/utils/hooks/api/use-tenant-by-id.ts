import useAspidaSWR from '@aspida/swr';
import { client } from '~/utils/api/client';
import { useAuth } from '../use-auth';
import { useAPIError } from './use-api-error';

export const useTenantById = (id?: number) => {
  const { token } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error } = useAspidaSWR(client.v1.tenants._tenantId(id || 0), {
    headers: {
      Authorization: `Bearer ${token || ''}`
    },
    key: id && token ? undefined : null
  });
  useAPIError(error);

  return [data];
};
