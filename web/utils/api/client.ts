import aspida from '@aspida/fetch';
import generatedApiTypes from 'api-types/api/$api';

export const baseURL = process.env.NEXT_PUBLIC_SERVER_ENDPOINT || '';

const fetchConfig = {
  baseURL,
  throwHttpErrors: true
};

export const client = generatedApiTypes(aspida(fetch, fetchConfig));
