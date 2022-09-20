import type { AspidaClient } from 'aspida'
import type { Methods as Methods0 } from './api/externals/v1/action'

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '')
  const PATH0 = '/api/externals/v1/action'
  const POST = 'POST'

  return {
    api: {
      externals: {
        v1: {
          action: {
            post: (option: { body: Methods0['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods0['post']['resBody']>(prefix, PATH0, POST, option).json(),
            $post: (option: { body: Methods0['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods0['post']['resBody']>(prefix, PATH0, POST, option).json().then(r => r.body),
            $path: () => `${prefix}${PATH0}`
          }
        }
      }
    }
  }
}

export type ApiInstance = ReturnType<typeof api>
export default api
