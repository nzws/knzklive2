import type { AspidaClient } from 'aspida';
import { dataToURLString } from 'aspida';
import type { Methods as Methods0 } from './v1/about';
import type { Methods as Methods1 } from './v1/auth/mastodon/callback';
import type { Methods as Methods2 } from './v1/auth/mastodon/login';
import type { Methods as Methods3 } from './v1/auth/mastodon/refresh';
import type { Methods as Methods4 } from './v1/auth/mastodon/revoke';
import type { Methods as Methods5 } from './v1/auth/mastodon/token';
import type { Methods as Methods6 } from './v1/internals/push/action';
import type { Methods as Methods7 } from './v1/internals/push/check-token';
import type { Methods as Methods8 } from './v1/lives/_liveId@number';
import type { Methods as Methods9 } from './v1/lives/_liveId@number/comments';
import type { Methods as Methods10 } from './v1/lives/_liveId@number/count';
import type { Methods as Methods11 } from './v1/lives/_liveId@number/url';
import type { Methods as Methods12 } from './v1/lives/explore';
import type { Methods as Methods13 } from './v1/lives/find/_tenantDomain@string/_idInTenant@number';
import type { Methods as Methods14 } from './v1/lives/find/_tenantId@number/top';
import type { Methods as Methods15 } from './v1/streams';
import type { Methods as Methods16 } from './v1/streams/_liveId@number';
import type { Methods as Methods17 } from './v1/streams/_liveId@number/action';
import type { Methods as Methods18 } from './v1/streams/_liveId@number/comment-viewer-url';
import type { Methods as Methods19 } from './v1/streams/_liveId@number/url';
import type { Methods as Methods20 } from './v1/tenants';
import type { Methods as Methods21 } from './v1/tenants/_tenantId@number';
import type { Methods as Methods22 } from './v1/tenants/_tenantId@number/stream-status';
import type { Methods as Methods23 } from './v1/tenants/find/_key';
import type { Methods as Methods24 } from './v1/users/_userId@number';
import type { Methods as Methods25 } from './v1/users/me';

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '');
  const PATH0 = '/v1/about';
  const PATH1 = '/v1/auth/mastodon/callback';
  const PATH2 = '/v1/auth/mastodon/login';
  const PATH3 = '/v1/auth/mastodon/refresh';
  const PATH4 = '/v1/auth/mastodon/revoke';
  const PATH5 = '/v1/auth/mastodon/token';
  const PATH6 = '/v1/internals/push/action';
  const PATH7 = '/v1/internals/push/check-token';
  const PATH8 = '/v1/lives';
  const PATH9 = '/comments';
  const PATH10 = '/count';
  const PATH11 = '/url';
  const PATH12 = '/v1/lives/explore';
  const PATH13 = '/v1/lives/find';
  const PATH14 = '/top';
  const PATH15 = '/v1/streams';
  const PATH16 = '/action';
  const PATH17 = '/comment-viewer-url';
  const PATH18 = '/v1/tenants';
  const PATH19 = '/stream-status';
  const PATH20 = '/v1/tenants/find';
  const PATH21 = '/v1/users';
  const PATH22 = '/v1/users/me';
  const GET = 'GET';
  const POST = 'POST';
  const DELETE = 'DELETE';
  const PATCH = 'PATCH';

  return {
    v1: {
      about: {
        get: (
          option?:
            | {
                headers?: Methods0['get']['reqHeaders'] | undefined;
                config?: T | undefined;
              }
            | undefined
        ) =>
          fetch<Methods0['get']['resBody']>(prefix, PATH0, GET, option).json(),
        $get: (
          option?:
            | {
                headers?: Methods0['get']['reqHeaders'] | undefined;
                config?: T | undefined;
              }
            | undefined
        ) =>
          fetch<Methods0['get']['resBody']>(prefix, PATH0, GET, option)
            .json()
            .then(r => r.body),
        $path: () => `${prefix}${PATH0}`
      },
      auth: {
        mastodon: {
          callback: {
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
          },
          login: {
            get: (option: {
              query: Methods2['get']['query'];
              config?: T | undefined;
            }) =>
              fetch<Methods2['get']['resBody']>(
                prefix,
                PATH2,
                GET,
                option
              ).json(),
            $get: (option: {
              query: Methods2['get']['query'];
              config?: T | undefined;
            }) =>
              fetch<Methods2['get']['resBody']>(prefix, PATH2, GET, option)
                .json()
                .then(r => r.body),
            $path: (
              option?:
                | {
                    method?: 'get' | undefined;
                    query: Methods2['get']['query'];
                  }
                | undefined
            ) =>
              `${prefix}${PATH2}${
                option && option.query
                  ? `?${dataToURLString(option.query)}`
                  : ''
              }`
          },
          refresh: {
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
          revoke: {
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
          },
          token: {
            post: (option: {
              body: Methods5['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods5['post']['resBody']>(
                prefix,
                PATH5,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods5['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods5['post']['resBody']>(prefix, PATH5, POST, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH5}`
          }
        }
      },
      internals: {
        push: {
          action: {
            post: (option: {
              body: Methods6['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods6['post']['resBody']>(
                prefix,
                PATH6,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods6['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods6['post']['resBody']>(prefix, PATH6, POST, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH6}`
          },
          check_token: {
            post: (option: {
              body: Methods7['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods7['post']['resBody']>(
                prefix,
                PATH7,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods7['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods7['post']['resBody']>(prefix, PATH7, POST, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH7}`
          }
        }
      },
      lives: {
        _liveId: (val2: number) => {
          const prefix2 = `${PATH8}/${val2}`;

          return {
            comments: {
              get: (
                option?:
                  | {
                      query?: Methods9['get']['query'] | undefined;
                      headers?: Methods9['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods9['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH9}`,
                  GET,
                  option
                ).json(),
              $get: (
                option?:
                  | {
                      query?: Methods9['get']['query'] | undefined;
                      headers?: Methods9['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods9['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH9}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              post: (option: {
                body: Methods9['post']['reqBody'];
                headers: Methods9['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods9['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH9}`,
                  POST,
                  option
                ).json(),
              $post: (option: {
                body: Methods9['post']['reqBody'];
                headers: Methods9['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods9['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH9}`,
                  POST,
                  option
                )
                  .json()
                  .then(r => r.body),
              delete: (option: {
                body: Methods9['delete']['reqBody'];
                headers: Methods9['delete']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods9['delete']['resBody']>(
                  prefix,
                  `${prefix2}${PATH9}`,
                  DELETE,
                  option
                ).json(),
              $delete: (option: {
                body: Methods9['delete']['reqBody'];
                headers: Methods9['delete']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods9['delete']['resBody']>(
                  prefix,
                  `${prefix2}${PATH9}`,
                  DELETE,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: (
                option?:
                  | {
                      method?: 'get' | undefined;
                      query: Methods9['get']['query'];
                    }
                  | undefined
              ) =>
                `${prefix}${prefix2}${PATH9}${
                  option && option.query
                    ? `?${dataToURLString(option.query)}`
                    : ''
                }`
            },
            count: {
              get: (
                option?:
                  | {
                      headers?: Methods10['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods10['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH10}`,
                  GET,
                  option
                ).json(),
              $get: (
                option?:
                  | {
                      headers?: Methods10['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods10['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH10}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH10}`
            },
            url: {
              get: (
                option?:
                  | {
                      headers?: Methods11['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods11['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH11}`,
                  GET,
                  option
                ).json(),
              $get: (
                option?:
                  | {
                      headers?: Methods11['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods11['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH11}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH11}`
            },
            get: (
              option?:
                | {
                    headers?: Methods8['get']['reqHeaders'] | undefined;
                    config?: T | undefined;
                  }
                | undefined
            ) =>
              fetch<Methods8['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              ).json(),
            $get: (
              option?:
                | {
                    headers?: Methods8['get']['reqHeaders'] | undefined;
                    config?: T | undefined;
                  }
                | undefined
            ) =>
              fetch<Methods8['get']['resBody']>(prefix, prefix2, GET, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${prefix2}`
          };
        },
        explore: {
          get: (
            option?:
              | {
                  headers?: Methods12['get']['reqHeaders'] | undefined;
                  config?: T | undefined;
                }
              | undefined
          ) =>
            fetch<Methods12['get']['resBody']>(
              prefix,
              PATH12,
              GET,
              option
            ).json(),
          $get: (
            option?:
              | {
                  headers?: Methods12['get']['reqHeaders'] | undefined;
                  config?: T | undefined;
                }
              | undefined
          ) =>
            fetch<Methods12['get']['resBody']>(prefix, PATH12, GET, option)
              .json()
              .then(r => r.body),
          $path: () => `${prefix}${PATH12}`
        },
        find: {
          _tenantDomain: (val3: string) => {
            const prefix3 = `${PATH13}/${val3}`;

            return {
              _idInTenant: (val4: number) => {
                const prefix4 = `${prefix3}/${val4}`;

                return {
                  get: (
                    option?:
                      | {
                          headers?: Methods13['get']['reqHeaders'] | undefined;
                          config?: T | undefined;
                        }
                      | undefined
                  ) =>
                    fetch<Methods13['get']['resBody']>(
                      prefix,
                      prefix4,
                      GET,
                      option
                    ).json(),
                  $get: (
                    option?:
                      | {
                          headers?: Methods13['get']['reqHeaders'] | undefined;
                          config?: T | undefined;
                        }
                      | undefined
                  ) =>
                    fetch<Methods13['get']['resBody']>(
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
          },
          _tenantId: (val3: number) => {
            const prefix3 = `${PATH13}/${val3}`;

            return {
              top: {
                get: (
                  option?:
                    | {
                        headers?: Methods14['get']['reqHeaders'] | undefined;
                        config?: T | undefined;
                      }
                    | undefined
                ) =>
                  fetch<Methods14['get']['resBody']>(
                    prefix,
                    `${prefix3}${PATH14}`,
                    GET,
                    option
                  ).json(),
                $get: (
                  option?:
                    | {
                        headers?: Methods14['get']['reqHeaders'] | undefined;
                        config?: T | undefined;
                      }
                    | undefined
                ) =>
                  fetch<Methods14['get']['resBody']>(
                    prefix,
                    `${prefix3}${PATH14}`,
                    GET,
                    option
                  )
                    .json()
                    .then(r => r.body),
                $path: () => `${prefix}${prefix3}${PATH14}`
              }
            };
          }
        }
      },
      streams: {
        _liveId: (val2: number) => {
          const prefix2 = `${PATH15}/${val2}`;

          return {
            action: {
              post: (option: {
                body: Methods17['post']['reqBody'];
                headers: Methods17['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods17['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH16}`,
                  POST,
                  option
                ).json(),
              $post: (option: {
                body: Methods17['post']['reqBody'];
                headers: Methods17['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods17['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH16}`,
                  POST,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH16}`
            },
            comment_viewer_url: {
              get: (option: {
                headers: Methods18['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods18['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH17}`,
                  GET,
                  option
                ).json(),
              $get: (option: {
                headers: Methods18['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods18['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH17}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH17}`
            },
            url: {
              get: (option: {
                headers: Methods19['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods19['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH11}`,
                  GET,
                  option
                ).json(),
              $get: (option: {
                headers: Methods19['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods19['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH11}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH11}`
            },
            patch: (option: {
              body: Methods16['patch']['reqBody'];
              headers: Methods16['patch']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods16['patch']['resBody']>(
                prefix,
                prefix2,
                PATCH,
                option
              ).json(),
            $patch: (option: {
              body: Methods16['patch']['reqBody'];
              headers: Methods16['patch']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods16['patch']['resBody']>(
                prefix,
                prefix2,
                PATCH,
                option
              )
                .json()
                .then(r => r.body),
            get: (option: {
              headers: Methods16['get']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods16['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              ).json(),
            $get: (option: {
              headers: Methods16['get']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods16['get']['resBody']>(prefix, prefix2, GET, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${prefix2}`
          };
        },
        post: (option: {
          body: Methods15['post']['reqBody'];
          headers: Methods15['post']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods15['post']['resBody']>(
            prefix,
            PATH15,
            POST,
            option
          ).json(),
        $post: (option: {
          body: Methods15['post']['reqBody'];
          headers: Methods15['post']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods15['post']['resBody']>(prefix, PATH15, POST, option)
            .json()
            .then(r => r.body),
        $path: () => `${prefix}${PATH15}`
      },
      tenants: {
        _tenantId: (val2: number) => {
          const prefix2 = `${PATH18}/${val2}`;

          return {
            stream_status: {
              get: (option: {
                headers: Methods22['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods22['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH19}`,
                  GET,
                  option
                ).json(),
              $get: (option: {
                headers: Methods22['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods22['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH19}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH19}`
            },
            patch: (option: {
              body: Methods21['patch']['reqBody'];
              headers: Methods21['patch']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods21['patch']['resBody']>(
                prefix,
                prefix2,
                PATCH,
                option
              ).json(),
            $patch: (option: {
              body: Methods21['patch']['reqBody'];
              headers: Methods21['patch']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods21['patch']['resBody']>(
                prefix,
                prefix2,
                PATCH,
                option
              )
                .json()
                .then(r => r.body),
            get: (option: {
              headers: Methods21['get']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods21['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              ).json(),
            $get: (option: {
              headers: Methods21['get']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods21['get']['resBody']>(prefix, prefix2, GET, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${prefix2}`
          };
        },
        find: {
          _key: (val3: number | string) => {
            const prefix3 = `${PATH20}/${val3}`;

            return {
              get: (
                option?:
                  | {
                      headers?: Methods23['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods23['get']['resBody']>(
                  prefix,
                  prefix3,
                  GET,
                  option
                ).json(),
              $get: (
                option?:
                  | {
                      headers?: Methods23['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods23['get']['resBody']>(prefix, prefix3, GET, option)
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix3}`
            };
          }
        },
        get: (option: {
          headers: Methods20['get']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods20['get']['resBody']>(
            prefix,
            PATH18,
            GET,
            option
          ).json(),
        $get: (option: {
          headers: Methods20['get']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods20['get']['resBody']>(prefix, PATH18, GET, option)
            .json()
            .then(r => r.body),
        $path: () => `${prefix}${PATH18}`
      },
      users: {
        _userId: (val2: number) => {
          const prefix2 = `${PATH21}/${val2}`;

          return {
            get: (
              option?:
                | {
                    headers?: Methods24['get']['reqHeaders'] | undefined;
                    config?: T | undefined;
                  }
                | undefined
            ) =>
              fetch<Methods24['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              ).json(),
            $get: (
              option?:
                | {
                    headers?: Methods24['get']['reqHeaders'] | undefined;
                    config?: T | undefined;
                  }
                | undefined
            ) =>
              fetch<Methods24['get']['resBody']>(prefix, prefix2, GET, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${prefix2}`
          };
        },
        me: {
          get: (option: {
            headers: Methods25['get']['reqHeaders'];
            config?: T | undefined;
          }) =>
            fetch<Methods25['get']['resBody']>(
              prefix,
              PATH22,
              GET,
              option
            ).json(),
          $get: (option: {
            headers: Methods25['get']['reqHeaders'];
            config?: T | undefined;
          }) =>
            fetch<Methods25['get']['resBody']>(prefix, PATH22, GET, option)
              .json()
              .then(r => r.body),
          $path: () => `${prefix}${PATH22}`
        }
      }
    }
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;
