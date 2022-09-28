import useAspidaSWR from '@aspida/swr';
import { client } from '~/utils/api/client';
import { useAPIError } from './use-api-error';

export const useExplore = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error } = useAspidaSWR(client.v1.lives.explore);
  useAPIError(error);

  const isLoading = data === undefined && error === undefined;

  return [data, isLoading] as const;
};
