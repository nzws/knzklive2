import aspida from '@aspida/fetch';
import generatedApiTypes from 'api-types/external-misskey/$api';

export const getMisskeyClient = (domain: string) =>
  generatedApiTypes(
    aspida(fetch, {
      baseURL: `https://${domain}`,
      throwHttpErrors: true
    })
  );
