import aspida from '@aspida/fetch';
import { video } from 'api-types';

export const videoApi = (baseURL: string) =>
  video(aspida(fetch, { baseURL, throwHttpErrors: true }));
