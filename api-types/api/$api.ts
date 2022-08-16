import type { AspidaClient } from 'aspida'
import { dataToURLString } from 'aspida'
import type { Methods as Methods0 } from './v1/tenants/_tenantDomain'

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '')
  const PATH0 = '/v1/tenants'
  const GET = 'GET'

  return {
    v1: {
      tenants: {
        _tenantDomain: (val2: number | string) => {
          const prefix2 = `${PATH0}/${val2}`

          return {
            get: (option?: { query?: Methods0['get']['query'] | undefined, config?: T | undefined } | undefined) =>
              fetch<Methods0['get']['resBody']>(prefix, prefix2, GET, option).json(),
            $get: (option?: { query?: Methods0['get']['query'] | undefined, config?: T | undefined } | undefined) =>
              fetch<Methods0['get']['resBody']>(prefix, prefix2, GET, option).json().then(r => r.body),
            $path: (option?: { method?: 'get' | undefined; query: Methods0['get']['query'] } | undefined) =>
              `${prefix}${prefix2}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
          }
        }
      }
    }
  }
}

export type ApiInstance = ReturnType<typeof api>
export default api
