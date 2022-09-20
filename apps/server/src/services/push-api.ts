import aspida from '@aspida/fetch';
import types from 'api-types/push/$api';

export const pushApi = (baseURL: string) =>
  types(aspida(fetch, { baseURL, throwHttpErrors: true }));
