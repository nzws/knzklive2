import useAspidaSWR from '@aspida/swr';
import { client } from '~/utils/api/client';
import { useAPIError } from './use-api-error';

export const useTenant = (slug?: string | number) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error } = useAspidaSWR(
    client.v1.tenants.find._slugOrId(slug || ''),
    {
      key: slug ? undefined : null
    }
  );
  useAPIError(error);

  return [data];
};
