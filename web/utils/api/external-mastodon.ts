import aspida from '@aspida/fetch';
import generatedApiTypes from '@api-types/external-mastodon/$api';

export const getMastodonClient = (domain: string) =>
  generatedApiTypes(
    aspida(fetch, {
      baseURL: `https://${domain}`,
      throwHttpErrors: true
    })
  );
