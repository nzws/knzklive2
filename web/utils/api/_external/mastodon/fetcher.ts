import { withQuery } from '~/utils/contexts/api';

export const mastodonFetcher = async <R>(
  domain: string,
  path: string,
  token?: string,
  query?: Record<string, string>,
  body?: Record<string, unknown>
): Promise<R | undefined> => {
  const link = withQuery(`https://${domain}${path}`, query);

  const response = await fetch(link, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    },
    ...(body ? { body: JSON.stringify(body), method: 'POST' } : {})
  });

  return response.json() as Promise<R>;
};
