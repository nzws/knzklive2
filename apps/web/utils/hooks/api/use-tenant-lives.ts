import useAspidaSWR from '@aspida/swr';
import { client } from '~/utils/api/client';
import { useAPIError } from './use-api-error';

export const useTenantLives = (slug?: string, page = 1) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error } = useAspidaSWR(
    client.v1.tenants.find._slugOrId(slug || '').lives,
    {
      query: {
        page
      },
      key: slug ? undefined : null
    }
  );
  useAPIError(error);

  const isLoading = data === undefined && error === undefined;

  return [data, isLoading] as const;
};
