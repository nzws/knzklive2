import aspida from '@aspida/fetch';
import { api } from 'api-types';

export const baseURL = process.env.SERVER_ENDPOINT || '';
export const serverToken = process.env.SERVER_TOKEN || '';

const fetchConfig = {
  baseURL,
  throwHttpErrors: true
};

export const client = api(aspida(fetch, fetchConfig));

export const checkToken = async (
  liveId: number,
  watchToken: string,
  pushToken: string
) => {
  try {
    await client.v1.internals.push.check_token.$post({
      body: {
        liveId,
        watchToken,
        pushToken,
        serverToken
      }
    });

    return true;
  } catch (e) {
    console.warn(e);
    return false;
  }
};
