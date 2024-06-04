import type { AspidaClient } from 'aspida';
import type { Methods as Methods_1h4hmv9 } from './api/v1/statuses';

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '');
  const PATH0 = '/api/v1/statuses';
  const POST = 'POST';

  return {
    api: {
      v1: {
        statuses: {
          post: (option: {
            body: Methods_1h4hmv9['post']['reqBody'];
            headers: Methods_1h4hmv9['post']['reqHeaders'];
            config?: T | undefined;
          }) =>
            fetch<Methods_1h4hmv9['post']['resBody']>(
              prefix,
              PATH0,
              POST,
              option
            ).json(),
          $post: (option: {
            body: Methods_1h4hmv9['post']['reqBody'];
            headers: Methods_1h4hmv9['post']['reqHeaders'];
            config?: T | undefined;
          }) =>
            fetch<Methods_1h4hmv9['post']['resBody']>(
              prefix,
              PATH0,
              POST,
              option
            )
              .json()
              .then(r => r.body),
          $path: () => `${prefix}${PATH0}`
        }
      }
    }
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;
