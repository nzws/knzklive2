import type { AspidaClient } from 'aspida';
import { dataToURLString } from 'aspida';
import type { Methods as Methods0 } from './v1/about';
import type { Methods as Methods1 } from './v1/auth/mastodon/callback';
import type { Methods as Methods2 } from './v1/auth/mastodon/login';
import type { Methods as Methods3 } from './v1/auth/mastodon/refresh';
import type { Methods as Methods4 } from './v1/auth/mastodon/revoke';
import type { Methods as Methods5 } from './v1/auth/mastodon/token';
import type { Methods as Methods6 } from './v1/auth/misskey/callback';
import type { Methods as Methods7 } from './v1/auth/misskey/login';
import type { Methods as Methods8 } from './v1/auth/misskey/refresh';
import type { Methods as Methods9 } from './v1/auth/misskey/revoke';
import type { Methods as Methods10 } from './v1/auth/misskey/token';
import type { Methods as Methods11 } from './v1/internals/push/action';
import type { Methods as Methods12 } from './v1/internals/push/check-token';
import type { Methods as Methods13 } from './v1/invites';
import type { Methods as Methods14 } from './v1/lives/_liveId@number';
import type { Methods as Methods15 } from './v1/lives/_liveId@number/comments';
import type { Methods as Methods16 } from './v1/lives/_liveId@number/count';
import type { Methods as Methods17 } from './v1/lives/_liveId@number/url';
import type { Methods as Methods18 } from './v1/lives/explore';
import type { Methods as Methods19 } from './v1/lives/find/_slug@string/_idInTenant@number';
import type { Methods as Methods20 } from './v1/streams';
import type { Methods as Methods21 } from './v1/streams/_liveId@number';
import type { Methods as Methods22 } from './v1/streams/_liveId@number/action';
import type { Methods as Methods23 } from './v1/streams/_liveId@number/comment-viewer-url';
import type { Methods as Methods24 } from './v1/streams/_liveId@number/url';
import type { Methods as Methods25 } from './v1/streams/thumbnail';
import type { Methods as Methods26 } from './v1/tenants';
import type { Methods as Methods27 } from './v1/tenants/_tenantId@number';
import type { Methods as Methods28 } from './v1/tenants/_tenantId@number/lives';
import type { Methods as Methods29 } from './v1/tenants/find/_slugOrId';
import type { Methods as Methods30 } from './v1/tenants/find/_slugOrId/lives';
import type { Methods as Methods31 } from './v1/users/_userId@number';
import type { Methods as Methods32 } from './v1/users/me';

const api = <T>({ baseURL, fetch }: AspidaClient<T>) => {
  const prefix = (baseURL === undefined ? '' : baseURL).replace(/\/$/, '');
  const PATH0 = '/v1/about';
  const PATH1 = '/v1/auth/mastodon/callback';
  const PATH2 = '/v1/auth/mastodon/login';
  const PATH3 = '/v1/auth/mastodon/refresh';
  const PATH4 = '/v1/auth/mastodon/revoke';
  const PATH5 = '/v1/auth/mastodon/token';
  const PATH6 = '/v1/auth/misskey/callback';
  const PATH7 = '/v1/auth/misskey/login';
  const PATH8 = '/v1/auth/misskey/refresh';
  const PATH9 = '/v1/auth/misskey/revoke';
  const PATH10 = '/v1/auth/misskey/token';
  const PATH11 = '/v1/internals/push/action';
  const PATH12 = '/v1/internals/push/check-token';
  const PATH13 = '/v1/invites';
  const PATH14 = '/v1/lives';
  const PATH15 = '/comments';
  const PATH16 = '/count';
  const PATH17 = '/url';
  const PATH18 = '/v1/lives/explore';
  const PATH19 = '/v1/lives/find';
  const PATH20 = '/v1/streams';
  const PATH21 = '/action';
  const PATH22 = '/comment-viewer-url';
  const PATH23 = '/v1/streams/thumbnail';
  const PATH24 = '/v1/tenants';
  const PATH25 = '/lives';
  const PATH26 = '/v1/tenants/find';
  const PATH27 = '/v1/users';
  const PATH28 = '/v1/users/me';
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
            get: (option: {
              query: Methods1['get']['query'];
              config?: T | undefined;
            }) =>
              fetch<Methods1['get']['resBody']>(
                prefix,
                PATH1,
                GET,
                option
              ).json(),
            $get: (option: {
              query: Methods1['get']['query'];
              config?: T | undefined;
            }) =>
              fetch<Methods1['get']['resBody']>(prefix, PATH1, GET, option)
                .json()
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
        },
        misskey: {
          callback: {
            get: (option: {
              query: Methods6['get']['query'];
              config?: T | undefined;
            }) =>
              fetch<Methods6['get']['resBody']>(
                prefix,
                PATH6,
                GET,
                option
              ).json(),
            $get: (option: {
              query: Methods6['get']['query'];
              config?: T | undefined;
            }) =>
              fetch<Methods6['get']['resBody']>(prefix, PATH6, GET, option)
                .json()
                .then(r => r.body),
            $path: (
              option?:
                | {
                    method?: 'get' | undefined;
                    query: Methods6['get']['query'];
                  }
                | undefined
            ) =>
              `${prefix}${PATH6}${
                option && option.query
                  ? `?${dataToURLString(option.query)}`
                  : ''
              }`
          },
          login: {
            get: (option: {
              query: Methods7['get']['query'];
              config?: T | undefined;
            }) =>
              fetch<Methods7['get']['resBody']>(
                prefix,
                PATH7,
                GET,
                option
              ).json(),
            $get: (option: {
              query: Methods7['get']['query'];
              config?: T | undefined;
            }) =>
              fetch<Methods7['get']['resBody']>(prefix, PATH7, GET, option)
                .json()
                .then(r => r.body),
            $path: (
              option?:
                | {
                    method?: 'get' | undefined;
                    query: Methods7['get']['query'];
                  }
                | undefined
            ) =>
              `${prefix}${PATH7}${
                option && option.query
                  ? `?${dataToURLString(option.query)}`
                  : ''
              }`
          },
          refresh: {
            post: (option: {
              body: Methods8['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods8['post']['resBody']>(
                prefix,
                PATH8,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods8['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods8['post']['resBody']>(prefix, PATH8, POST, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH8}`
          },
          revoke: {
            post: (option: {
              body: Methods9['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods9['post']['resBody']>(
                prefix,
                PATH9,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods9['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods9['post']['resBody']>(prefix, PATH9, POST, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH9}`
          },
          token: {
            post: (option: {
              body: Methods10['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods10['post']['resBody']>(
                prefix,
                PATH10,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods10['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods10['post']['resBody']>(prefix, PATH10, POST, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH10}`
          }
        }
      },
      internals: {
        push: {
          action: {
            post: (option: {
              body: Methods11['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods11['post']['resBody']>(
                prefix,
                PATH11,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods11['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods11['post']['resBody']>(prefix, PATH11, POST, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH11}`
          },
          check_token: {
            post: (option: {
              body: Methods12['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods12['post']['resBody']>(
                prefix,
                PATH12,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods12['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods12['post']['resBody']>(prefix, PATH12, POST, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH12}`
          }
        }
      },
      invites: {
        get: (option: {
          headers: Methods13['get']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods13['get']['resBody']>(
            prefix,
            PATH13,
            GET,
            option
          ).json(),
        $get: (option: {
          headers: Methods13['get']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods13['get']['resBody']>(prefix, PATH13, GET, option)
            .json()
            .then(r => r.body),
        post: (option: {
          headers: Methods13['post']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods13['post']['resBody']>(
            prefix,
            PATH13,
            POST,
            option
          ).json(),
        $post: (option: {
          headers: Methods13['post']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods13['post']['resBody']>(prefix, PATH13, POST, option)
            .json()
            .then(r => r.body),
        $path: () => `${prefix}${PATH13}`
      },
      lives: {
        _liveId: (val2: number) => {
          const prefix2 = `${PATH14}/${val2}`;

          return {
            comments: {
              get: (
                option?:
                  | {
                      query?: Methods15['get']['query'] | undefined;
                      headers?: Methods15['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods15['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH15}`,
                  GET,
                  option
                ).json(),
              $get: (
                option?:
                  | {
                      query?: Methods15['get']['query'] | undefined;
                      headers?: Methods15['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods15['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH15}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              post: (option: {
                body: Methods15['post']['reqBody'];
                headers: Methods15['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods15['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH15}`,
                  POST,
                  option
                ).json(),
              $post: (option: {
                body: Methods15['post']['reqBody'];
                headers: Methods15['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods15['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH15}`,
                  POST,
                  option
                )
                  .json()
                  .then(r => r.body),
              delete: (option: {
                query: Methods15['delete']['query'];
                headers: Methods15['delete']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods15['delete']['resBody']>(
                  prefix,
                  `${prefix2}${PATH15}`,
                  DELETE,
                  option
                ).json(),
              $delete: (option: {
                query: Methods15['delete']['query'];
                headers: Methods15['delete']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods15['delete']['resBody']>(
                  prefix,
                  `${prefix2}${PATH15}`,
                  DELETE,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: (
                option?:
                  | {
                      method?: 'get' | undefined;
                      query: Methods15['get']['query'];
                    }
                  | { method: 'delete'; query: Methods15['delete']['query'] }
                  | undefined
              ) =>
                `${prefix}${prefix2}${PATH15}${
                  option && option.query
                    ? `?${dataToURLString(option.query)}`
                    : ''
                }`
            },
            count: {
              get: (
                option?:
                  | {
                      headers?: Methods16['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods16['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH16}`,
                  GET,
                  option
                ).json(),
              $get: (
                option?:
                  | {
                      headers?: Methods16['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods16['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH16}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH16}`
            },
            url: {
              get: (
                option?:
                  | {
                      headers?: Methods17['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods17['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH17}`,
                  GET,
                  option
                ).json(),
              $get: (
                option?:
                  | {
                      headers?: Methods17['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods17['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH17}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH17}`
            },
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
                prefix2,
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
              fetch<Methods14['get']['resBody']>(prefix, prefix2, GET, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${prefix2}`
          };
        },
        explore: {
          get: (
            option?:
              | {
                  headers?: Methods18['get']['reqHeaders'] | undefined;
                  config?: T | undefined;
                }
              | undefined
          ) =>
            fetch<Methods18['get']['resBody']>(
              prefix,
              PATH18,
              GET,
              option
            ).json(),
          $get: (
            option?:
              | {
                  headers?: Methods18['get']['reqHeaders'] | undefined;
                  config?: T | undefined;
                }
              | undefined
          ) =>
            fetch<Methods18['get']['resBody']>(prefix, PATH18, GET, option)
              .json()
              .then(r => r.body),
          $path: () => `${prefix}${PATH18}`
        },
        find: {
          _slug: (val3: string) => {
            const prefix3 = `${PATH19}/${val3}`;

            return {
              _idInTenant: (val4: number) => {
                const prefix4 = `${prefix3}/${val4}`;

                return {
                  get: (
                    option?:
                      | {
                          headers?: Methods19['get']['reqHeaders'] | undefined;
                          config?: T | undefined;
                        }
                      | undefined
                  ) =>
                    fetch<Methods19['get']['resBody']>(
                      prefix,
                      prefix4,
                      GET,
                      option
                    ).json(),
                  $get: (
                    option?:
                      | {
                          headers?: Methods19['get']['reqHeaders'] | undefined;
                          config?: T | undefined;
                        }
                      | undefined
                  ) =>
                    fetch<Methods19['get']['resBody']>(
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
          const prefix2 = `${PATH20}/${val2}`;

          return {
            action: {
              post: (option: {
                body: Methods22['post']['reqBody'];
                headers: Methods22['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods22['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH21}`,
                  POST,
                  option
                ).json(),
              $post: (option: {
                body: Methods22['post']['reqBody'];
                headers: Methods22['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods22['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH21}`,
                  POST,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH21}`
            },
            comment_viewer_url: {
              get: (option: {
                headers: Methods23['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods23['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH22}`,
                  GET,
                  option
                ).json(),
              $get: (option: {
                headers: Methods23['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods23['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH22}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH22}`
            },
            url: {
              get: (option: {
                headers: Methods24['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods24['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH17}`,
                  GET,
                  option
                ).json(),
              $get: (option: {
                headers: Methods24['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods24['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH17}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH17}`
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
        thumbnail: {
          post: (option: {
            body: Methods25['post']['reqBody'];
            headers: Methods25['post']['reqHeaders'];
            config?: T | undefined;
          }) =>
            fetch<Methods25['post']['resBody']>(
              prefix,
              PATH23,
              POST,
              option,
              'FormData'
            ).json(),
          $post: (option: {
            body: Methods25['post']['reqBody'];
            headers: Methods25['post']['reqHeaders'];
            config?: T | undefined;
          }) =>
            fetch<Methods25['post']['resBody']>(
              prefix,
              PATH23,
              POST,
              option,
              'FormData'
            )
              .json()
              .then(r => r.body),
          $path: () => `${prefix}${PATH23}`
        },
        post: (option: {
          body: Methods20['post']['reqBody'];
          headers: Methods20['post']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods20['post']['resBody']>(
            prefix,
            PATH20,
            POST,
            option
          ).json(),
        $post: (option: {
          body: Methods20['post']['reqBody'];
          headers: Methods20['post']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods20['post']['resBody']>(prefix, PATH20, POST, option)
            .json()
            .then(r => r.body),
        $path: () => `${prefix}${PATH20}`
      },
      tenants: {
        _tenantId: (val2: number) => {
          const prefix2 = `${PATH24}/${val2}`;

          return {
            lives: {
              get: (
                option?:
                  | {
                      query?: Methods28['get']['query'] | undefined;
                      headers?: Methods28['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods28['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH25}`,
                  GET,
                  option
                ).json(),
              $get: (
                option?:
                  | {
                      query?: Methods28['get']['query'] | undefined;
                      headers?: Methods28['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods28['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH25}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: (
                option?:
                  | {
                      method?: 'get' | undefined;
                      query: Methods28['get']['query'];
                    }
                  | undefined
              ) =>
                `${prefix}${prefix2}${PATH25}${
                  option && option.query
                    ? `?${dataToURLString(option.query)}`
                    : ''
                }`
            },
            patch: (option: {
              body: Methods27['patch']['reqBody'];
              headers: Methods27['patch']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods27['patch']['resBody']>(
                prefix,
                prefix2,
                PATCH,
                option
              ).json(),
            $patch: (option: {
              body: Methods27['patch']['reqBody'];
              headers: Methods27['patch']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods27['patch']['resBody']>(
                prefix,
                prefix2,
                PATCH,
                option
              )
                .json()
                .then(r => r.body),
            get: (option: {
              headers: Methods27['get']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods27['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              ).json(),
            $get: (option: {
              headers: Methods27['get']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods27['get']['resBody']>(prefix, prefix2, GET, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${prefix2}`
          };
        },
        find: {
          _slugOrId: (val3: number | string) => {
            const prefix3 = `${PATH26}/${val3}`;

            return {
              lives: {
                get: (
                  option?:
                    | {
                        query?: Methods30['get']['query'] | undefined;
                        headers?: Methods30['get']['reqHeaders'] | undefined;
                        config?: T | undefined;
                      }
                    | undefined
                ) =>
                  fetch<Methods30['get']['resBody']>(
                    prefix,
                    `${prefix3}${PATH25}`,
                    GET,
                    option
                  ).json(),
                $get: (
                  option?:
                    | {
                        query?: Methods30['get']['query'] | undefined;
                        headers?: Methods30['get']['reqHeaders'] | undefined;
                        config?: T | undefined;
                      }
                    | undefined
                ) =>
                  fetch<Methods30['get']['resBody']>(
                    prefix,
                    `${prefix3}${PATH25}`,
                    GET,
                    option
                  )
                    .json()
                    .then(r => r.body),
                $path: (
                  option?:
                    | {
                        method?: 'get' | undefined;
                        query: Methods30['get']['query'];
                      }
                    | undefined
                ) =>
                  `${prefix}${prefix3}${PATH25}${
                    option && option.query
                      ? `?${dataToURLString(option.query)}`
                      : ''
                  }`
              },
              get: (
                option?:
                  | {
                      headers?: Methods29['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods29['get']['resBody']>(
                  prefix,
                  prefix3,
                  GET,
                  option
                ).json(),
              $get: (
                option?:
                  | {
                      headers?: Methods29['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods29['get']['resBody']>(prefix, prefix3, GET, option)
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix3}`
            };
          }
        },
        get: (option: {
          headers: Methods26['get']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods26['get']['resBody']>(
            prefix,
            PATH24,
            GET,
            option
          ).json(),
        $get: (option: {
          headers: Methods26['get']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods26['get']['resBody']>(prefix, PATH24, GET, option)
            .json()
            .then(r => r.body),
        post: (option: {
          body: Methods26['post']['reqBody'];
          headers: Methods26['post']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods26['post']['resBody']>(
            prefix,
            PATH24,
            POST,
            option
          ).json(),
        $post: (option: {
          body: Methods26['post']['reqBody'];
          headers: Methods26['post']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods26['post']['resBody']>(prefix, PATH24, POST, option)
            .json()
            .then(r => r.body),
        $path: () => `${prefix}${PATH24}`
      },
      users: {
        _userId: (val2: number) => {
          const prefix2 = `${PATH27}/${val2}`;

          return {
            get: (
              option?:
                | {
                    headers?: Methods31['get']['reqHeaders'] | undefined;
                    config?: T | undefined;
                  }
                | undefined
            ) =>
              fetch<Methods31['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              ).json(),
            $get: (
              option?:
                | {
                    headers?: Methods31['get']['reqHeaders'] | undefined;
                    config?: T | undefined;
                  }
                | undefined
            ) =>
              fetch<Methods31['get']['resBody']>(prefix, prefix2, GET, option)
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${prefix2}`
          };
        },
        me: {
          get: (option: {
            headers: Methods32['get']['reqHeaders'];
            config?: T | undefined;
          }) =>
            fetch<Methods32['get']['resBody']>(
              prefix,
              PATH28,
              GET,
              option
            ).json(),
          $get: (option: {
            headers: Methods32['get']['reqHeaders'];
            config?: T | undefined;
          }) =>
            fetch<Methods32['get']['resBody']>(prefix, PATH28, GET, option)
              .json()
              .then(r => r.body),
          $path: () => `${prefix}${PATH28}`
        }
      }
    }
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;
