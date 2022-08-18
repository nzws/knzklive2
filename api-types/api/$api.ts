import type { AspidaClient } from 'aspida'
import { dataToURLString } from 'aspida'
import type { Methods as Methods0 } from './v1/auth/mastodon/login'
import type { Methods as Methods1 } from './v1/auth/mastodon/refresh'
import type { Methods as Methods2 } from './v1/auth/mastodon/revoke'
import type { Methods as Methods3 } from './v1/auth/mastodon/token'
import type { Methods as Methods4 } from './v1/tenants/_tenantDomain'
import type { Methods as Methods5 } from './v1/users/me'

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '')
  const PATH0 = '/v1/auth/mastodon/login'
  const PATH1 = '/v1/auth/mastodon/refresh'
  const PATH2 = '/v1/auth/mastodon/revoke'
  const PATH3 = '/v1/auth/mastodon/token'
  const PATH4 = '/v1/tenants'
  const PATH5 = '/v1/users/me'
  const GET = 'GET'
  const POST = 'POST'

  return {
    v1: {
      auth: {
        mastodon: {
          login: {
            get: (option: { query: Methods0['get']['query'], config?: T | undefined }) =>
              fetch(prefix, PATH0, GET, option).send(),
            $get: (option: { query: Methods0['get']['query'], config?: T | undefined }) =>
              fetch(prefix, PATH0, GET, option).send().then(r => r.body),
            $path: (option?: { method?: 'get' | undefined; query: Methods0['get']['query'] } | undefined) =>
              `${prefix}${PATH0}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
          },
          refresh: {
            post: (option: { body: Methods1['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods1['post']['resBody']>(prefix, PATH1, POST, option).json(),
            $post: (option: { body: Methods1['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods1['post']['resBody']>(prefix, PATH1, POST, option).json().then(r => r.body),
            $path: () => `${prefix}${PATH1}`
          },
          revoke: {
            post: (option: { body: Methods2['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods2['post']['resBody']>(prefix, PATH2, POST, option).json(),
            $post: (option: { body: Methods2['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods2['post']['resBody']>(prefix, PATH2, POST, option).json().then(r => r.body),
            $path: () => `${prefix}${PATH2}`
          },
          token: {
            post: (option: { body: Methods3['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods3['post']['resBody']>(prefix, PATH3, POST, option).json(),
            $post: (option: { body: Methods3['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods3['post']['resBody']>(prefix, PATH3, POST, option).json().then(r => r.body),
            $path: () => `${prefix}${PATH3}`
          }
        }
      },
      tenants: {
        _tenantDomain: (val2: number | string) => {
          const prefix2 = `${PATH4}/${val2}`

          return {
            get: (option?: { query?: Methods4['get']['query'] | undefined, config?: T | undefined } | undefined) =>
              fetch<Methods4['get']['resBody']>(prefix, prefix2, GET, option).json(),
            $get: (option?: { query?: Methods4['get']['query'] | undefined, config?: T | undefined } | undefined) =>
              fetch<Methods4['get']['resBody']>(prefix, prefix2, GET, option).json().then(r => r.body),
            $path: (option?: { method?: 'get' | undefined; query: Methods4['get']['query'] } | undefined) =>
              `${prefix}${prefix2}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
          }
        }
      },
      users: {
        me: {
          get: (option: { headers: Methods5['get']['reqHeaders'], config?: T | undefined }) =>
            fetch<Methods5['get']['resBody']>(prefix, PATH5, GET, option).json(),
          $get: (option: { headers: Methods5['get']['reqHeaders'], config?: T | undefined }) =>
            fetch<Methods5['get']['resBody']>(prefix, PATH5, GET, option).json().then(r => r.body),
          $path: () => `${prefix}${PATH5}`
        }
      }
    }
  }
}

export type ApiInstance = ReturnType<typeof api>
export default api
