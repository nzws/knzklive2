import type { AspidaClient } from 'aspida'
import { dataToURLString } from 'aspida'
import type { Methods as Methods0 } from './v1/auth/mastodon/callback'
import type { Methods as Methods1 } from './v1/auth/mastodon/login'
import type { Methods as Methods2 } from './v1/auth/mastodon/refresh'
import type { Methods as Methods3 } from './v1/auth/mastodon/revoke'
import type { Methods as Methods4 } from './v1/auth/mastodon/token'
import type { Methods as Methods5 } from './v1/tenants/_tenantDomain'
import type { Methods as Methods6 } from './v1/users/me'

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '')
  const PATH0 = '/v1/auth/mastodon/callback'
  const PATH1 = '/v1/auth/mastodon/login'
  const PATH2 = '/v1/auth/mastodon/refresh'
  const PATH3 = '/v1/auth/mastodon/revoke'
  const PATH4 = '/v1/auth/mastodon/token'
  const PATH5 = '/v1/tenants'
  const PATH6 = '/v1/users/me'
  const GET = 'GET'
  const POST = 'POST'

  return {
    v1: {
      auth: {
        mastodon: {
          callback: {
            post: (option: { body: Methods0['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods0['post']['resBody']>(prefix, PATH0, POST, option).json(),
            $post: (option: { body: Methods0['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods0['post']['resBody']>(prefix, PATH0, POST, option).json().then(r => r.body),
            $path: () => `${prefix}${PATH0}`
          },
          login: {
            get: (option: { query: Methods1['get']['query'], config?: T | undefined }) =>
              fetch(prefix, PATH1, GET, option).send(),
            $get: (option: { query: Methods1['get']['query'], config?: T | undefined }) =>
              fetch(prefix, PATH1, GET, option).send().then(r => r.body),
            $path: (option?: { method?: 'get' | undefined; query: Methods1['get']['query'] } | undefined) =>
              `${prefix}${PATH1}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
          },
          refresh: {
            post: (option: { body: Methods2['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods2['post']['resBody']>(prefix, PATH2, POST, option).json(),
            $post: (option: { body: Methods2['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods2['post']['resBody']>(prefix, PATH2, POST, option).json().then(r => r.body),
            $path: () => `${prefix}${PATH2}`
          },
          revoke: {
            post: (option: { body: Methods3['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods3['post']['resBody']>(prefix, PATH3, POST, option).text(),
            $post: (option: { body: Methods3['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods3['post']['resBody']>(prefix, PATH3, POST, option).text().then(r => r.body),
            $path: () => `${prefix}${PATH3}`
          },
          token: {
            post: (option: { body: Methods4['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods4['post']['resBody']>(prefix, PATH4, POST, option).json(),
            $post: (option: { body: Methods4['post']['reqBody'], config?: T | undefined }) =>
              fetch<Methods4['post']['resBody']>(prefix, PATH4, POST, option).json().then(r => r.body),
            $path: () => `${prefix}${PATH4}`
          }
        }
      },
      tenants: {
        _tenantDomain: (val2: number | string) => {
          const prefix2 = `${PATH5}/${val2}`

          return {
            get: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods5['get']['resBody']>(prefix, prefix2, GET, option).json(),
            $get: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods5['get']['resBody']>(prefix, prefix2, GET, option).json().then(r => r.body),
            $path: () => `${prefix}${prefix2}`
          }
        }
      },
      users: {
        me: {
          get: (option: { headers: Methods6['get']['reqHeaders'], config?: T | undefined }) =>
            fetch<Methods6['get']['resBody']>(prefix, PATH6, GET, option).json(),
          $get: (option: { headers: Methods6['get']['reqHeaders'], config?: T | undefined }) =>
            fetch<Methods6['get']['resBody']>(prefix, PATH6, GET, option).json().then(r => r.body),
          $path: () => `${prefix}${PATH6}`
        }
      }
    }
  }
}

export type ApiInstance = ReturnType<typeof api>
export default api
