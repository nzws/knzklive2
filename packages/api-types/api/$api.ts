import type { AspidaClient } from 'aspida';
import { dataToURLString } from 'aspida';
import type { Methods as Methods0 } from './v1/auth/mastodon/callback';
import type { Methods as Methods1 } from './v1/auth/mastodon/login';
import type { Methods as Methods2 } from './v1/auth/mastodon/refresh';
import type { Methods as Methods3 } from './v1/auth/mastodon/revoke';
import type { Methods as Methods4 } from './v1/auth/mastodon/token';
import type { Methods as Methods5 } from './v1/lives/_liveId@number/comments';
import type { Methods as Methods6 } from './v1/lives/_liveId@number/url';
import type { Methods as Methods7 } from './v1/lives/explore';
import type { Methods as Methods8 } from './v1/lives/find/_tenantId@number/_idInTenant@number';
import type { Methods as Methods9 } from './v1/streams';
import type { Methods as Methods10 } from './v1/streams/_liveId@number';
import type { Methods as Methods11 } from './v1/streams/_liveId@number/action';
import type { Methods as Methods12 } from './v1/streams/_liveId@number/url';
import type { Methods as Methods13 } from './v1/tenants/_tenantDomain';
import type { Methods as Methods14 } from './v1/users/_userId@number';
import type { Methods as Methods15 } from './v1/users/me';

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '');
  const PATH0 = '/v1/auth/mastodon/callback';
  const PATH1 = '/v1/auth/mastodon/login';
  const PATH2 = '/v1/auth/mastodon/refresh';
  const PATH3 = '/v1/auth/mastodon/revoke';
  const PATH4 = '/v1/auth/mastodon/token';
  const PATH5 = '/v1/lives';
  const PATH6 = '/comments';
  const PATH7 = '/url';
  const PATH8 = '/v1/lives/explore';
  const PATH9 = '/v1/lives/find';
  const PATH10 = '/v1/streams';
  const PATH11 = '/action';
  const PATH12 = '/v1/tenants';
  const PATH13 = '/v1/users';
  const PATH14 = '/v1/users/me';
  const GET = 'GET';
  const POST = 'POST';
  const DELETE = 'DELETE';
  const PATCH = 'PATCH';

  return {
    v1: {
      auth: {
        mastodon: {
          callback: {
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
          login: {
            get: (option: {
              query: Methods1['get']['query'];
              config?: T | undefined;
            }) => fetch(prefix, PATH1, GET, option).send(),
            $get: (option: {
              query: Methods1['get']['query'];
              config?: T | undefined;
            }) =>
              fetch(prefix, PATH1, GET, option)
                .send()
                .then(r => r.body),
            $path: (
              option?:
                | {
                    method?: 'get' | undefined;
                    query: Methods1['get']['query'];
                  }
                | undefined
            ) =>
              `${prefix}${PATH1}${
                option && option.query
                  ? `?${dataToURLString(option.query)}`
                  : ''
              }`
          },
          refresh: {
            post: (option: {
              body: Methods2['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods2['post']['resBody']>(
                prefix,
                PATH2,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods2['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods2['post']['resBody']>(prefix, PATH2, POST, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH2}`
          },
          revoke: {
            post: (option: {
              body: Methods3['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods3['post']['resBody']>(
                prefix,
                PATH3,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods3['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods3['post']['resBody']>(prefix, PATH3, POST, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH3}`
          },
          token: {
            post: (option: {
              body: Methods4['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods4['post']['resBody']>(
                prefix,
                PATH4,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods4['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods4['post']['resBody']>(prefix, PATH4, POST, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH4}`
          }
        }
      },
      lives: {
        _liveId: (val2: number) => {
          const prefix2 = `${PATH5}/${val2}`;

          return {
            comments: {
              get: (option?: { config?: T | undefined } | undefined) =>
                fetch<Methods5['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH6}`,
                  GET,
                  option
                ).json(),
              $get: (option?: { config?: T | undefined } | undefined) =>
                fetch<Methods5['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH6}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              post: (option: {
                body: Methods5['post']['reqBody'];
                headers: Methods5['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods5['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH6}`,
                  POST,
                  option
                ).json(),
              $post: (option: {
                body: Methods5['post']['reqBody'];
                headers: Methods5['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods5['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH6}`,
                  POST,
                  option
                )
                  .json()
                  .then(r => r.body),
              delete: (option: {
                body: Methods5['delete']['reqBody'];
                headers: Methods5['delete']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods5['delete']['resBody']>(
                  prefix,
                  `${prefix2}${PATH6}`,
                  DELETE,
                  option
                ).json(),
              $delete: (option: {
                body: Methods5['delete']['reqBody'];
                headers: Methods5['delete']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods5['delete']['resBody']>(
                  prefix,
                  `${prefix2}${PATH6}`,
                  DELETE,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH6}`
            },
            url: {
              get: (
                option?:
                  | {
                      headers?: Methods6['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods6['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH7}`,
                  GET,
                  option
                ).json(),
              $get: (
                option?:
                  | {
                      headers?: Methods6['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods6['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH7}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH7}`
            }
          };
        },
        explore: {
          get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods7['get']['resBody']>(
              prefix,
              PATH8,
              GET,
              option
            ).json(),
          $get: (option?: { config?: T | undefined } | undefined) =>
            fetch<Methods7['get']['resBody']>(prefix, PATH8, GET, option)
              .json()
              .then(r => r.body),
          $path: () => `${prefix}${PATH8}`
        },
        find: {
          _tenantId: (val3: number) => {
            const prefix3 = `${PATH9}/${val3}`;

            return {
              _idInTenant: (val4: number) => {
                const prefix4 = `${prefix3}/${val4}`;

                return {
                  get: (option?: { config?: T | undefined } | undefined) =>
                    fetch<Methods8['get']['resBody']>(
                      prefix,
                      prefix4,
                      GET,
                      option
                    ).json(),
                  $get: (option?: { config?: T | undefined } | undefined) =>
                    fetch<Methods8['get']['resBody']>(
                      prefix,
                      prefix4,
                      GET,
                      option
                    )
                      .json()
                      .then(r => r.body),
                  $path: () => `${prefix}${prefix4}`
                };
              }
            };
          }
        }
      },
      streams: {
        _liveId: (val2: number) => {
          const prefix2 = `${PATH10}/${val2}`;

          return {
            action: {
              post: (option: {
                body: Methods11['post']['reqBody'];
                headers: Methods11['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods11['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH11}`,
                  POST,
                  option
                ).json(),
              $post: (option: {
                body: Methods11['post']['reqBody'];
                headers: Methods11['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods11['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH11}`,
                  POST,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH11}`
            },
            url: {
              get: (option: {
                headers: Methods12['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods12['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH7}`,
                  GET,
                  option
                ).json(),
              $get: (option: {
                headers: Methods12['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods12['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH7}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH7}`
            },
            patch: (option: {
              body: Methods10['patch']['reqBody'];
              headers: Methods10['patch']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods10['patch']['resBody']>(
                prefix,
                prefix2,
                PATCH,
                option
              ).json(),
            $patch: (option: {
              body: Methods10['patch']['reqBody'];
              headers: Methods10['patch']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods10['patch']['resBody']>(
                prefix,
                prefix2,
                PATCH,
                option
              )
                .json()
                .then(r => r.body),
            get: (option: {
              headers: Methods10['get']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods10['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              ).json(),
            $get: (option: {
              headers: Methods10['get']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods10['get']['resBody']>(prefix, prefix2, GET, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${prefix2}`
          };
        },
        post: (option: {
          body: Methods9['post']['reqBody'];
          headers: Methods9['post']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods9['post']['resBody']>(
            prefix,
            PATH10,
            POST,
            option
          ).json(),
        $post: (option: {
          body: Methods9['post']['reqBody'];
          headers: Methods9['post']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods9['post']['resBody']>(prefix, PATH10, POST, option)
            .json()
            .then(r => r.body),
        $path: () => `${prefix}${PATH10}`
      },
      tenants: {
        _tenantDomain: (val2: number | string) => {
          const prefix2 = `${PATH12}/${val2}`;

          return {
            get: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods13['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              ).json(),
            $get: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods13['get']['resBody']>(prefix, prefix2, GET, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${prefix2}`
          };
        }
      },
      users: {
        _userId: (val2: number) => {
          const prefix2 = `${PATH13}/${val2}`;

          return {
            get: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods14['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              ).json(),
            $get: (option?: { config?: T | undefined } | undefined) =>
              fetch<Methods14['get']['resBody']>(prefix, prefix2, GET, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${prefix2}`
          };
        },
        me: {
          get: (option: {
            headers: Methods15['get']['reqHeaders'];
            config?: T | undefined;
          }) =>
            fetch<Methods15['get']['resBody']>(
              prefix,
              PATH14,
              GET,
              option
            ).json(),
          $get: (option: {
            headers: Methods15['get']['reqHeaders'];
            config?: T | undefined;
          }) =>
            fetch<Methods15['get']['resBody']>(prefix, PATH14, GET, option)
              .json()
              .then(r => r.body),
          $path: () => `${prefix}${PATH14}`
        }
      }
    }
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;
