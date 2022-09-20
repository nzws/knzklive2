import aspida from '@aspida/fetch';
import { push } from 'api-types';

export const pushApi = (baseURL: string) =>
  push(aspida(fetch, { baseURL, throwHttpErrors: true }));
