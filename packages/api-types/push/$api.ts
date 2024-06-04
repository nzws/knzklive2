import type { AspidaClient } from 'aspida';
import type { Methods as Methods_1p49xj6 } from './api/externals/v1/action';
import type { Methods as Methods_1ovx5p0 } from './api/externals/v1/thumbnail';

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '');
  const PATH0 = '/api/externals/v1/action';
  const PATH1 = '/api/externals/v1/thumbnail';
  const POST = 'POST';

  return {
    api: {
      externals: {
        v1: {
          action: {
            post: (option: {
              body: Methods_1p49xj6['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_1p49xj6['post']['resBody']>(
                prefix,
                PATH0,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods_1p49xj6['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_1p49xj6['post']['resBody']>(
                prefix,
                PATH0,
                POST,
                option
              )
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH0}`
          },
          thumbnail: {
            post: (option: {
              body: Methods_1ovx5p0['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_1ovx5p0['post']['resBody']>(
                prefix,
                PATH1,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods_1ovx5p0['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_1ovx5p0['post']['resBody']>(
                prefix,
                PATH1,
                POST,
                option
              )
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH1}`
          }
        }
      }
    }
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;
