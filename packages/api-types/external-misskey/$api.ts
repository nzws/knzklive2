import type { AspidaClient } from 'aspida';
import type { Methods as Methods_17gbsmd } from './api/notes/create';

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '');
  const PATH0 = '/api/notes/create';
  const POST = 'POST';

  return {
    api: {
      notes: {
        create: {
          post: (option: {
            body: Methods_17gbsmd['post']['reqBody'];
            config?: T | undefined;
          }) =>
            fetch<Methods_17gbsmd['post']['resBody']>(
              prefix,
              PATH0,
              POST,
              option
            ).json(),
          $post: (option: {
            body: Methods_17gbsmd['post']['reqBody'];
            config?: T | undefined;
          }) =>
            fetch<Methods_17gbsmd['post']['resBody']>(
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
