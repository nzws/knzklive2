export const TOKEN_KEY = 'knzklive-token';

export const fetcher = async <T>(url: string): Promise<T> => {
  const token = localStorage.getItem(TOKEN_KEY);

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    }
  });

  return response.json() as Promise<T>;
};

export const withQuery = <T = Record<string, string>>(
  url: string,
  query: T
) => {
  const queryString = Object.entries(query)
    .map(([key, value]) => `${key}=${value as string}`)
    .join('&');
  return `${url}?${queryString}`;
};
