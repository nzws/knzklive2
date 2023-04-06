import type { AspidaClient } from 'aspida';
import type { Methods as Methods0 } from './api/externals/v1/recording/publish';
import type { Methods as Methods1 } from './api/externals/v1/recording/unpublish';

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '');
  const PATH0 = '/api/externals/v1/recording/publish';
  const PATH1 = '/api/externals/v1/recording/unpublish';
  const POST = 'POST';

  return {
    api: {
      externals: {
        v1: {
          recording: {
            publish: {
              post: (option: {
                body: Methods0['post']['reqBody'];
                config?: T | undefined;
              }) =>
                fetch<Methods0['post']['resBody']>(
                  prefix,
                  PATH0,
                  POST,
                  option
                ).json(),
              $post: (option: {
                body: Methods0['post']['reqBody'];
                config?: T | undefined;
              }) =>
                fetch<Methods0['post']['resBody']>(prefix, PATH0, POST, option)
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${PATH0}`
            },
            unpublish: {
              post: (option: {
                body: Methods1['post']['reqBody'];
                config?: T | undefined;
              }) =>
                fetch<Methods1['post']['resBody']>(
                  prefix,
                  PATH1,
                  POST,
                  option
                ).json(),
              $post: (option: {
                body: Methods1['post']['reqBody'];
                config?: T | undefined;
              }) =>
                fetch<Methods1['post']['resBody']>(prefix, PATH1, POST, option)
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${PATH1}`
            }
          }
        }
      }
    }
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;
