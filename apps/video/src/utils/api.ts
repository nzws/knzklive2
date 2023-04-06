import aspida from '@aspida/fetch';
import { api } from 'api-types';

export const baseURL = process.env.SERVER_ENDPOINT || '';
export const serverToken = process.env.SERVER_TOKEN || '';

const fetchConfig = {
  baseURL,
  throwHttpErrors: true
};

export const client = api(aspida(fetch, fetchConfig));
