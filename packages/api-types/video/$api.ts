import type { AspidaClient } from 'aspida';
import type { Methods as Methods_4p4vzr } from './api/externals/v1/recording/publish';
import type { Methods as Methods_17uvs9a } from './api/externals/v1/recording/unpublish';

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
                body: Methods_4p4vzr['post']['reqBody'];
                config?: T | undefined;
              }) =>
                fetch<Methods_4p4vzr['post']['resBody']>(
                  prefix,
                  PATH0,
                  POST,
                  option
                ).json(),
              $post: (option: {
                body: Methods_4p4vzr['post']['reqBody'];
                config?: T | undefined;
              }) =>
                fetch<Methods_4p4vzr['post']['resBody']>(
                  prefix,
                  PATH0,
                  POST,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${PATH0}`
            },
            unpublish: {
              post: (option: {
                body: Methods_17uvs9a['post']['reqBody'];
                config?: T | undefined;
              }) =>
                fetch<Methods_17uvs9a['post']['resBody']>(
                  prefix,
                  PATH1,
                  POST,
                  option
                ).json(),
              $post: (option: {
                body: Methods_17uvs9a['post']['reqBody'];
                config?: T | undefined;
              }) =>
                fetch<Methods_17uvs9a['post']['resBody']>(
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
    }
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;
