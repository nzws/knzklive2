import useAspidaSWR from '@aspida/swr';
import { TenantPublic } from 'api-types/common/types';
import { client } from '~/utils/api/client';
import { useAPIError } from './use-api-error';

export const useTenant = (domain: string, fallbackData?: TenantPublic) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error } = useAspidaSWR(client.v1.tenants.find._key(domain), {
    fallbackData
  });
  useAPIError(error);

  return [data];
};
