import useSWR from 'swr';

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then(res => res.json());

export const useAnnouncements = () => {
  const { data } = useSWR<
    {
      url: string;
      title: string;
      id: string;
    }[]
  >('/api/announcements', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false
  });

  return data;
};
