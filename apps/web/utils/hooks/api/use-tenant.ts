import useAspidaSWR from '@aspida/swr';
import { client } from '~/utils/api/client';
import { useAPIError } from './use-api-error';

export const useTenant = (slug: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error } = useAspidaSWR(client.v1.tenants.find._slug(slug));
  useAPIError(error);

  return [data];
};
