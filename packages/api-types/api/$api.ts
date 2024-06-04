import type { AspidaClient } from 'aspida';
import { dataToURLString } from 'aspida';
import type { Methods as Methods_b3exqt } from './v1/about';
import type { Methods as Methods_zo9ena } from './v1/auth/mastodon/callback';
import type { Methods as Methods_yck5jm } from './v1/auth/mastodon/login';
import type { Methods as Methods_g7lqtw } from './v1/auth/mastodon/refresh';
import type { Methods as Methods_1alo4nn } from './v1/auth/mastodon/revoke';
import type { Methods as Methods_vwwzrm } from './v1/auth/mastodon/token';
import type { Methods as Methods_4j9x8 } from './v1/auth/misskey/callback';
import type { Methods as Methods_rweivk } from './v1/auth/misskey/login';
import type { Methods as Methods_7ek692 } from './v1/auth/misskey/refresh';
import type { Methods as Methods_12e73wp } from './v1/auth/misskey/revoke';
import type { Methods as Methods_oqqrxc } from './v1/auth/misskey/token';
import type { Methods as Methods_1l7izl6 } from './v1/internals/push/action';
import type { Methods as Methods_jvbbec } from './v1/internals/push/check-token';
import type { Methods as Methods_1iiv4ik } from './v1/internals/video/check-outdated';
import type { Methods as Methods_gu6xh7 } from './v1/internals/video/signal';
import type { Methods as Methods_a24e26 } from './v1/invites';
import type { Methods as Methods_l6a9uv } from './v1/lives/_liveId@number';
import type { Methods as Methods_1xrcwxj } from './v1/lives/_liveId@number/check-relation';
import type { Methods as Methods_1n6zere } from './v1/lives/_liveId@number/comments';
import type { Methods as Methods_1lxg5o7 } from './v1/lives/_liveId@number/count';
import type { Methods as Methods_hchnah } from './v1/lives/_liveId@number/url';
import type { Methods as Methods_1ou31sr } from './v1/lives/explore';
import type { Methods as Methods_1jqr2r8 } from './v1/lives/find/_slug@string/_idInTenant@number';
import type { Methods as Methods_5gnb9l } from './v1/streams';
import type { Methods as Methods_1veam95 } from './v1/streams/_liveId@number';
import type { Methods as Methods_1rprl8g } from './v1/streams/_liveId@number/action';
import type { Methods as Methods_xu6x0k } from './v1/streams/_liveId@number/comment-viewer-url';
import type { Methods as Methods_1atwewx } from './v1/streams/_liveId@number/recording';
import type { Methods as Methods_dnsr } from './v1/streams/_liveId@number/url';
import type { Methods as Methods_9qhh6i } from './v1/streams/thumbnail';
import type { Methods as Methods_1jkaejl } from './v1/tenants';
import type { Methods as Methods_e5218j } from './v1/tenants/_tenantId@number';
import type { Methods as Methods_oshzm6 } from './v1/tenants/_tenantId@number/auto-mod';
import type { Methods as Methods_bvnwsq } from './v1/tenants/_tenantId@number/auto-mod/_id@number';
import type { Methods as Methods_14fcgzb } from './v1/tenants/_tenantId@number/lives';
import type { Methods as Methods_15me5i4 } from './v1/tenants/find/_slugOrId';
import type { Methods as Methods_1dslozc } from './v1/tenants/find/_slugOrId/lives';
import type { Methods as Methods_1npqkyd } from './v1/users/_userId@number';
import type { Methods as Methods_zyr5pb } from './v1/users/me';
import type { Methods as Methods_1g8nz8q } from './v1/videos/_liveId@number';
import type { Methods as Methods_117kp4t } from './v1/videos/_liveId@number/event';

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
  const PATH13 = '/v1/internals/video/check-outdated';
  const PATH14 = '/v1/internals/video/signal';
  const PATH15 = '/v1/invites';
  const PATH16 = '/v1/lives';
  const PATH17 = '/check-relation';
  const PATH18 = '/comments';
  const PATH19 = '/count';
  const PATH20 = '/url';
  const PATH21 = '/v1/lives/explore';
  const PATH22 = '/v1/lives/find';
  const PATH23 = '/v1/streams';
  const PATH24 = '/action';
  const PATH25 = '/comment-viewer-url';
  const PATH26 = '/recording';
  const PATH27 = '/v1/streams/thumbnail';
  const PATH28 = '/v1/tenants';
  const PATH29 = '/auto-mod';
  const PATH30 = '/lives';
  const PATH31 = '/v1/tenants/find';
  const PATH32 = '/v1/users';
  const PATH33 = '/v1/users/me';
  const PATH34 = '/v1/videos';
  const PATH35 = '/event';
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
                headers?: Methods_b3exqt['get']['reqHeaders'] | undefined;
                config?: T | undefined;
              }
            | undefined
        ) =>
          fetch<Methods_b3exqt['get']['resBody']>(
            prefix,
            PATH0,
            GET,
            option
          ).json(),
        $get: (
          option?:
            | {
                headers?: Methods_b3exqt['get']['reqHeaders'] | undefined;
                config?: T | undefined;
              }
            | undefined
        ) =>
          fetch<Methods_b3exqt['get']['resBody']>(prefix, PATH0, GET, option)
            .json()
            .then(r => r.body),
        $path: () => `${prefix}${PATH0}`
      },
      auth: {
        mastodon: {
          callback: {
            get: (option: {
              query: Methods_zo9ena['get']['query'];
              config?: T | undefined;
            }) =>
              fetch<Methods_zo9ena['get']['resBody']>(
                prefix,
                PATH1,
                GET,
                option
              ).json(),
            $get: (option: {
              query: Methods_zo9ena['get']['query'];
              config?: T | undefined;
            }) =>
              fetch<Methods_zo9ena['get']['resBody']>(
                prefix,
                PATH1,
                GET,
                option
              )
                .json()
                .then(r => r.body),
            $path: (
              option?:
                | {
                    method?: 'get' | undefined;
                    query: Methods_zo9ena['get']['query'];
                  }
                | undefined
            ) =>
              `${prefix}${PATH1}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
          },
          login: {
            get: (option: {
              query: Methods_yck5jm['get']['query'];
              config?: T | undefined;
            }) =>
              fetch<Methods_yck5jm['get']['resBody']>(
                prefix,
                PATH2,
                GET,
                option
              ).json(),
            $get: (option: {
              query: Methods_yck5jm['get']['query'];
              config?: T | undefined;
            }) =>
              fetch<Methods_yck5jm['get']['resBody']>(
                prefix,
                PATH2,
                GET,
                option
              )
                .json()
                .then(r => r.body),
            $path: (
              option?:
                | {
                    method?: 'get' | undefined;
                    query: Methods_yck5jm['get']['query'];
                  }
                | undefined
            ) =>
              `${prefix}${PATH2}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
          },
          refresh: {
            post: (option: {
              body: Methods_g7lqtw['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_g7lqtw['post']['resBody']>(
                prefix,
                PATH3,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods_g7lqtw['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_g7lqtw['post']['resBody']>(
                prefix,
                PATH3,
                POST,
                option
              )
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH3}`
          },
          revoke: {
            post: (option: {
              body: Methods_1alo4nn['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_1alo4nn['post']['resBody']>(
                prefix,
                PATH4,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods_1alo4nn['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_1alo4nn['post']['resBody']>(
                prefix,
                PATH4,
                POST,
                option
              )
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH4}`
          },
          token: {
            post: (option: {
              body: Methods_vwwzrm['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_vwwzrm['post']['resBody']>(
                prefix,
                PATH5,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods_vwwzrm['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_vwwzrm['post']['resBody']>(
                prefix,
                PATH5,
                POST,
                option
              )
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH5}`
          }
        },
        misskey: {
          callback: {
            get: (option: {
              query: Methods_4j9x8['get']['query'];
              config?: T | undefined;
            }) =>
              fetch<Methods_4j9x8['get']['resBody']>(
                prefix,
                PATH6,
                GET,
                option
              ).json(),
            $get: (option: {
              query: Methods_4j9x8['get']['query'];
              config?: T | undefined;
            }) =>
              fetch<Methods_4j9x8['get']['resBody']>(prefix, PATH6, GET, option)
                .json()
                .then(r => r.body),
            $path: (
              option?:
                | {
                    method?: 'get' | undefined;
                    query: Methods_4j9x8['get']['query'];
                  }
                | undefined
            ) =>
              `${prefix}${PATH6}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
          },
          login: {
            get: (option: {
              query: Methods_rweivk['get']['query'];
              config?: T | undefined;
            }) =>
              fetch<Methods_rweivk['get']['resBody']>(
                prefix,
                PATH7,
                GET,
                option
              ).json(),
            $get: (option: {
              query: Methods_rweivk['get']['query'];
              config?: T | undefined;
            }) =>
              fetch<Methods_rweivk['get']['resBody']>(
                prefix,
                PATH7,
                GET,
                option
              )
                .json()
                .then(r => r.body),
            $path: (
              option?:
                | {
                    method?: 'get' | undefined;
                    query: Methods_rweivk['get']['query'];
                  }
                | undefined
            ) =>
              `${prefix}${PATH7}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
          },
          refresh: {
            post: (option: {
              body: Methods_7ek692['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_7ek692['post']['resBody']>(
                prefix,
                PATH8,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods_7ek692['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_7ek692['post']['resBody']>(
                prefix,
                PATH8,
                POST,
                option
              )
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH8}`
          },
          revoke: {
            post: (option: {
              body: Methods_12e73wp['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_12e73wp['post']['resBody']>(
                prefix,
                PATH9,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods_12e73wp['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_12e73wp['post']['resBody']>(
                prefix,
                PATH9,
                POST,
                option
              )
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH9}`
          },
          token: {
            post: (option: {
              body: Methods_oqqrxc['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_oqqrxc['post']['resBody']>(
                prefix,
                PATH10,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods_oqqrxc['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_oqqrxc['post']['resBody']>(
                prefix,
                PATH10,
                POST,
                option
              )
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
              body: Methods_1l7izl6['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_1l7izl6['post']['resBody']>(
                prefix,
                PATH11,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods_1l7izl6['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_1l7izl6['post']['resBody']>(
                prefix,
                PATH11,
                POST,
                option
              )
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH11}`
          },
          check_token: {
            post: (option: {
              body: Methods_jvbbec['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_jvbbec['post']['resBody']>(
                prefix,
                PATH12,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods_jvbbec['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_jvbbec['post']['resBody']>(
                prefix,
                PATH12,
                POST,
                option
              )
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH12}`
          }
        },
        video: {
          check_outdated: {
            post: (option: {
              body: Methods_1iiv4ik['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_1iiv4ik['post']['resBody']>(
                prefix,
                PATH13,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods_1iiv4ik['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_1iiv4ik['post']['resBody']>(
                prefix,
                PATH13,
                POST,
                option
              )
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH13}`
          },
          signal: {
            post: (option: {
              body: Methods_gu6xh7['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_gu6xh7['post']['resBody']>(
                prefix,
                PATH14,
                POST,
                option
              ).json(),
            $post: (option: {
              body: Methods_gu6xh7['post']['reqBody'];
              config?: T | undefined;
            }) =>
              fetch<Methods_gu6xh7['post']['resBody']>(
                prefix,
                PATH14,
                POST,
                option
              )
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${PATH14}`
          }
        }
      },
      invites: {
        get: (option: {
          headers: Methods_a24e26['get']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods_a24e26['get']['resBody']>(
            prefix,
            PATH15,
            GET,
            option
          ).json(),
        $get: (option: {
          headers: Methods_a24e26['get']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods_a24e26['get']['resBody']>(prefix, PATH15, GET, option)
            .json()
            .then(r => r.body),
        post: (option: {
          headers: Methods_a24e26['post']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods_a24e26['post']['resBody']>(
            prefix,
            PATH15,
            POST,
            option
          ).json(),
        $post: (option: {
          headers: Methods_a24e26['post']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods_a24e26['post']['resBody']>(prefix, PATH15, POST, option)
            .json()
            .then(r => r.body),
        $path: () => `${prefix}${PATH15}`
      },
      lives: {
        _liveId: (val2: number) => {
          const prefix2 = `${PATH16}/${val2}`;

          return {
            check_relation: {
              post: (option: {
                body: Methods_1xrcwxj['post']['reqBody'];
                headers?: Methods_1xrcwxj['post']['reqHeaders'] | undefined;
                config?: T | undefined;
              }) =>
                fetch<Methods_1xrcwxj['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH17}`,
                  POST,
                  option
                ).json(),
              $post: (option: {
                body: Methods_1xrcwxj['post']['reqBody'];
                headers?: Methods_1xrcwxj['post']['reqHeaders'] | undefined;
                config?: T | undefined;
              }) =>
                fetch<Methods_1xrcwxj['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH17}`,
                  POST,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH17}`
            },
            comments: {
              get: (
                option?:
                  | {
                      query?: Methods_1n6zere['get']['query'] | undefined;
                      headers?:
                        | Methods_1n6zere['get']['reqHeaders']
                        | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods_1n6zere['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH18}`,
                  GET,
                  option
                ).json(),
              $get: (
                option?:
                  | {
                      query?: Methods_1n6zere['get']['query'] | undefined;
                      headers?:
                        | Methods_1n6zere['get']['reqHeaders']
                        | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods_1n6zere['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH18}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              post: (option: {
                body: Methods_1n6zere['post']['reqBody'];
                headers: Methods_1n6zere['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_1n6zere['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH18}`,
                  POST,
                  option
                ).json(),
              $post: (option: {
                body: Methods_1n6zere['post']['reqBody'];
                headers: Methods_1n6zere['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_1n6zere['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH18}`,
                  POST,
                  option
                )
                  .json()
                  .then(r => r.body),
              delete: (option: {
                query: Methods_1n6zere['delete']['query'];
                headers: Methods_1n6zere['delete']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_1n6zere['delete']['resBody']>(
                  prefix,
                  `${prefix2}${PATH18}`,
                  DELETE,
                  option
                ).json(),
              $delete: (option: {
                query: Methods_1n6zere['delete']['query'];
                headers: Methods_1n6zere['delete']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_1n6zere['delete']['resBody']>(
                  prefix,
                  `${prefix2}${PATH18}`,
                  DELETE,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: (
                option?:
                  | {
                      method?: 'get' | undefined;
                      query: Methods_1n6zere['get']['query'];
                    }
                  | {
                      method: 'delete';
                      query: Methods_1n6zere['delete']['query'];
                    }
                  | undefined
              ) =>
                `${prefix}${prefix2}${PATH18}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
            },
            count: {
              get: (
                option?:
                  | {
                      headers?:
                        | Methods_1lxg5o7['get']['reqHeaders']
                        | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods_1lxg5o7['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH19}`,
                  GET,
                  option
                ).json(),
              $get: (
                option?:
                  | {
                      headers?:
                        | Methods_1lxg5o7['get']['reqHeaders']
                        | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods_1lxg5o7['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH19}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH19}`
            },
            url: {
              get: (
                option?:
                  | {
                      headers?: Methods_hchnah['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods_hchnah['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH20}`,
                  GET,
                  option
                ).json(),
              $get: (
                option?:
                  | {
                      headers?: Methods_hchnah['get']['reqHeaders'] | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods_hchnah['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH20}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH20}`
            },
            get: (
              option?:
                | {
                    headers?: Methods_l6a9uv['get']['reqHeaders'] | undefined;
                    config?: T | undefined;
                  }
                | undefined
            ) =>
              fetch<Methods_l6a9uv['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              ).json(),
            $get: (
              option?:
                | {
                    headers?: Methods_l6a9uv['get']['reqHeaders'] | undefined;
                    config?: T | undefined;
                  }
                | undefined
            ) =>
              fetch<Methods_l6a9uv['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              )
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${prefix2}`
          };
        },
        explore: {
          get: (
            option?:
              | {
                  headers?: Methods_1ou31sr['get']['reqHeaders'] | undefined;
                  config?: T | undefined;
                }
              | undefined
          ) =>
            fetch<Methods_1ou31sr['get']['resBody']>(
              prefix,
              PATH21,
              GET,
              option
            ).json(),
          $get: (
            option?:
              | {
                  headers?: Methods_1ou31sr['get']['reqHeaders'] | undefined;
                  config?: T | undefined;
                }
              | undefined
          ) =>
            fetch<Methods_1ou31sr['get']['resBody']>(
              prefix,
              PATH21,
              GET,
              option
            )
              .json()
              .then(r => r.body),
          $path: () => `${prefix}${PATH21}`
        },
        find: {
          _slug: (val3: string) => {
            const prefix3 = `${PATH22}/${val3}`;

            return {
              _idInTenant: (val4: number) => {
                const prefix4 = `${prefix3}/${val4}`;

                return {
                  get: (
                    option?:
                      | {
                          headers?:
                            | Methods_1jqr2r8['get']['reqHeaders']
                            | undefined;
                          config?: T | undefined;
                        }
                      | undefined
                  ) =>
                    fetch<Methods_1jqr2r8['get']['resBody']>(
                      prefix,
                      prefix4,
                      GET,
                      option
                    ).json(),
                  $get: (
                    option?:
                      | {
                          headers?:
                            | Methods_1jqr2r8['get']['reqHeaders']
                            | undefined;
                          config?: T | undefined;
                        }
                      | undefined
                  ) =>
                    fetch<Methods_1jqr2r8['get']['resBody']>(
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
          const prefix2 = `${PATH23}/${val2}`;

          return {
            action: {
              post: (option: {
                body: Methods_1rprl8g['post']['reqBody'];
                headers: Methods_1rprl8g['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_1rprl8g['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH24}`,
                  POST,
                  option
                ).json(),
              $post: (option: {
                body: Methods_1rprl8g['post']['reqBody'];
                headers: Methods_1rprl8g['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_1rprl8g['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH24}`,
                  POST,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH24}`
            },
            comment_viewer_url: {
              get: (option: {
                headers: Methods_xu6x0k['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_xu6x0k['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH25}`,
                  GET,
                  option
                ).json(),
              $get: (option: {
                headers: Methods_xu6x0k['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_xu6x0k['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH25}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH25}`
            },
            recording: {
              post: (option: {
                headers: Methods_1atwewx['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_1atwewx['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH26}`,
                  POST,
                  option
                ).json(),
              $post: (option: {
                headers: Methods_1atwewx['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_1atwewx['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH26}`,
                  POST,
                  option
                )
                  .json()
                  .then(r => r.body),
              delete: (option: {
                headers: Methods_1atwewx['delete']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_1atwewx['delete']['resBody']>(
                  prefix,
                  `${prefix2}${PATH26}`,
                  DELETE,
                  option
                ).json(),
              $delete: (option: {
                headers: Methods_1atwewx['delete']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_1atwewx['delete']['resBody']>(
                  prefix,
                  `${prefix2}${PATH26}`,
                  DELETE,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH26}`
            },
            url: {
              get: (option: {
                headers: Methods_dnsr['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_dnsr['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH20}`,
                  GET,
                  option
                ).json(),
              $get: (option: {
                headers: Methods_dnsr['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_dnsr['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH20}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH20}`
            },
            patch: (option: {
              body: Methods_1veam95['patch']['reqBody'];
              headers: Methods_1veam95['patch']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods_1veam95['patch']['resBody']>(
                prefix,
                prefix2,
                PATCH,
                option
              ).json(),
            $patch: (option: {
              body: Methods_1veam95['patch']['reqBody'];
              headers: Methods_1veam95['patch']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods_1veam95['patch']['resBody']>(
                prefix,
                prefix2,
                PATCH,
                option
              )
                .json()
                .then(r => r.body),
            get: (option: {
              headers: Methods_1veam95['get']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods_1veam95['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              ).json(),
            $get: (option: {
              headers: Methods_1veam95['get']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods_1veam95['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              )
                .json()
                .then(r => r.body),
            delete: (option: {
              headers: Methods_1veam95['delete']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods_1veam95['delete']['resBody']>(
                prefix,
                prefix2,
                DELETE,
                option
              ).json(),
            $delete: (option: {
              headers: Methods_1veam95['delete']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods_1veam95['delete']['resBody']>(
                prefix,
                prefix2,
                DELETE,
                option
              )
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${prefix2}`
          };
        },
        thumbnail: {
          post: (option: {
            body: Methods_9qhh6i['post']['reqBody'];
            headers: Methods_9qhh6i['post']['reqHeaders'];
            config?: T | undefined;
          }) =>
            fetch<Methods_9qhh6i['post']['resBody']>(
              prefix,
              PATH27,
              POST,
              option,
              'FormData'
            ).json(),
          $post: (option: {
            body: Methods_9qhh6i['post']['reqBody'];
            headers: Methods_9qhh6i['post']['reqHeaders'];
            config?: T | undefined;
          }) =>
            fetch<Methods_9qhh6i['post']['resBody']>(
              prefix,
              PATH27,
              POST,
              option,
              'FormData'
            )
              .json()
              .then(r => r.body),
          $path: () => `${prefix}${PATH27}`
        },
        post: (option: {
          body: Methods_5gnb9l['post']['reqBody'];
          headers: Methods_5gnb9l['post']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods_5gnb9l['post']['resBody']>(
            prefix,
            PATH23,
            POST,
            option
          ).json(),
        $post: (option: {
          body: Methods_5gnb9l['post']['reqBody'];
          headers: Methods_5gnb9l['post']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods_5gnb9l['post']['resBody']>(prefix, PATH23, POST, option)
            .json()
            .then(r => r.body),
        $path: () => `${prefix}${PATH23}`
      },
      tenants: {
        _tenantId: (val2: number) => {
          const prefix2 = `${PATH28}/${val2}`;

          return {
            auto_mod: {
              _id: (val4: number) => {
                const prefix4 = `${prefix2}${PATH29}/${val4}`;

                return {
                  delete: (option: {
                    headers: Methods_bvnwsq['delete']['reqHeaders'];
                    config?: T | undefined;
                  }) =>
                    fetch<Methods_bvnwsq['delete']['resBody']>(
                      prefix,
                      prefix4,
                      DELETE,
                      option
                    ).json(),
                  $delete: (option: {
                    headers: Methods_bvnwsq['delete']['reqHeaders'];
                    config?: T | undefined;
                  }) =>
                    fetch<Methods_bvnwsq['delete']['resBody']>(
                      prefix,
                      prefix4,
                      DELETE,
                      option
                    )
                      .json()
                      .then(r => r.body),
                  $path: () => `${prefix}${prefix4}`
                };
              },
              get: (option: {
                headers: Methods_oshzm6['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_oshzm6['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH29}`,
                  GET,
                  option
                ).json(),
              $get: (option: {
                headers: Methods_oshzm6['get']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_oshzm6['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH29}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              post: (option: {
                body: Methods_oshzm6['post']['reqBody'];
                headers: Methods_oshzm6['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_oshzm6['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH29}`,
                  POST,
                  option
                ).json(),
              $post: (option: {
                body: Methods_oshzm6['post']['reqBody'];
                headers: Methods_oshzm6['post']['reqHeaders'];
                config?: T | undefined;
              }) =>
                fetch<Methods_oshzm6['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH29}`,
                  POST,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH29}`
            },
            lives: {
              get: (
                option?:
                  | {
                      query?: Methods_14fcgzb['get']['query'] | undefined;
                      headers?:
                        | Methods_14fcgzb['get']['reqHeaders']
                        | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods_14fcgzb['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH30}`,
                  GET,
                  option
                ).json(),
              $get: (
                option?:
                  | {
                      query?: Methods_14fcgzb['get']['query'] | undefined;
                      headers?:
                        | Methods_14fcgzb['get']['reqHeaders']
                        | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods_14fcgzb['get']['resBody']>(
                  prefix,
                  `${prefix2}${PATH30}`,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: (
                option?:
                  | {
                      method?: 'get' | undefined;
                      query: Methods_14fcgzb['get']['query'];
                    }
                  | undefined
              ) =>
                `${prefix}${prefix2}${PATH30}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
            },
            patch: (option: {
              body: Methods_e5218j['patch']['reqBody'];
              headers: Methods_e5218j['patch']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods_e5218j['patch']['resBody']>(
                prefix,
                prefix2,
                PATCH,
                option
              ).json(),
            $patch: (option: {
              body: Methods_e5218j['patch']['reqBody'];
              headers: Methods_e5218j['patch']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods_e5218j['patch']['resBody']>(
                prefix,
                prefix2,
                PATCH,
                option
              )
                .json()
                .then(r => r.body),
            get: (option: {
              headers: Methods_e5218j['get']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods_e5218j['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              ).json(),
            $get: (option: {
              headers: Methods_e5218j['get']['reqHeaders'];
              config?: T | undefined;
            }) =>
              fetch<Methods_e5218j['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              )
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${prefix2}`
          };
        },
        find: {
          _slugOrId: (val3: number | string) => {
            const prefix3 = `${PATH31}/${val3}`;

            return {
              lives: {
                get: (
                  option?:
                    | {
                        query?: Methods_1dslozc['get']['query'] | undefined;
                        headers?:
                          | Methods_1dslozc['get']['reqHeaders']
                          | undefined;
                        config?: T | undefined;
                      }
                    | undefined
                ) =>
                  fetch<Methods_1dslozc['get']['resBody']>(
                    prefix,
                    `${prefix3}${PATH30}`,
                    GET,
                    option
                  ).json(),
                $get: (
                  option?:
                    | {
                        query?: Methods_1dslozc['get']['query'] | undefined;
                        headers?:
                          | Methods_1dslozc['get']['reqHeaders']
                          | undefined;
                        config?: T | undefined;
                      }
                    | undefined
                ) =>
                  fetch<Methods_1dslozc['get']['resBody']>(
                    prefix,
                    `${prefix3}${PATH30}`,
                    GET,
                    option
                  )
                    .json()
                    .then(r => r.body),
                $path: (
                  option?:
                    | {
                        method?: 'get' | undefined;
                        query: Methods_1dslozc['get']['query'];
                      }
                    | undefined
                ) =>
                  `${prefix}${prefix3}${PATH30}${option && option.query ? `?${dataToURLString(option.query)}` : ''}`
              },
              get: (
                option?:
                  | {
                      headers?:
                        | Methods_15me5i4['get']['reqHeaders']
                        | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods_15me5i4['get']['resBody']>(
                  prefix,
                  prefix3,
                  GET,
                  option
                ).json(),
              $get: (
                option?:
                  | {
                      headers?:
                        | Methods_15me5i4['get']['reqHeaders']
                        | undefined;
                      config?: T | undefined;
                    }
                  | undefined
              ) =>
                fetch<Methods_15me5i4['get']['resBody']>(
                  prefix,
                  prefix3,
                  GET,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix3}`
            };
          }
        },
        get: (option: {
          headers: Methods_1jkaejl['get']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods_1jkaejl['get']['resBody']>(
            prefix,
            PATH28,
            GET,
            option
          ).json(),
        $get: (option: {
          headers: Methods_1jkaejl['get']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods_1jkaejl['get']['resBody']>(prefix, PATH28, GET, option)
            .json()
            .then(r => r.body),
        post: (option: {
          body: Methods_1jkaejl['post']['reqBody'];
          headers: Methods_1jkaejl['post']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods_1jkaejl['post']['resBody']>(
            prefix,
            PATH28,
            POST,
            option
          ).json(),
        $post: (option: {
          body: Methods_1jkaejl['post']['reqBody'];
          headers: Methods_1jkaejl['post']['reqHeaders'];
          config?: T | undefined;
        }) =>
          fetch<Methods_1jkaejl['post']['resBody']>(
            prefix,
            PATH28,
            POST,
            option
          )
            .json()
            .then(r => r.body),
        $path: () => `${prefix}${PATH28}`
      },
      users: {
        _userId: (val2: number) => {
          const prefix2 = `${PATH32}/${val2}`;

          return {
            get: (
              option?:
                | {
                    headers?: Methods_1npqkyd['get']['reqHeaders'] | undefined;
                    config?: T | undefined;
                  }
                | undefined
            ) =>
              fetch<Methods_1npqkyd['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              ).json(),
            $get: (
              option?:
                | {
                    headers?: Methods_1npqkyd['get']['reqHeaders'] | undefined;
                    config?: T | undefined;
                  }
                | undefined
            ) =>
              fetch<Methods_1npqkyd['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              )
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${prefix2}`
          };
        },
        me: {
          get: (option: {
            headers: Methods_zyr5pb['get']['reqHeaders'];
            config?: T | undefined;
          }) =>
            fetch<Methods_zyr5pb['get']['resBody']>(
              prefix,
              PATH33,
              GET,
              option
            ).json(),
          $get: (option: {
            headers: Methods_zyr5pb['get']['reqHeaders'];
            config?: T | undefined;
          }) =>
            fetch<Methods_zyr5pb['get']['resBody']>(prefix, PATH33, GET, option)
              .json()
              .then(r => r.body),
          $path: () => `${prefix}${PATH33}`
        }
      },
      videos: {
        _liveId: (val2: number) => {
          const prefix2 = `${PATH34}/${val2}`;

          return {
            event: {
              post: (option: {
                body: Methods_117kp4t['post']['reqBody'];
                headers?: Methods_117kp4t['post']['reqHeaders'] | undefined;
                config?: T | undefined;
              }) =>
                fetch<Methods_117kp4t['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH35}`,
                  POST,
                  option
                ).json(),
              $post: (option: {
                body: Methods_117kp4t['post']['reqBody'];
                headers?: Methods_117kp4t['post']['reqHeaders'] | undefined;
                config?: T | undefined;
              }) =>
                fetch<Methods_117kp4t['post']['resBody']>(
                  prefix,
                  `${prefix2}${PATH35}`,
                  POST,
                  option
                )
                  .json()
                  .then(r => r.body),
              $path: () => `${prefix}${prefix2}${PATH35}`
            },
            get: (
              option?:
                | {
                    headers?: Methods_1g8nz8q['get']['reqHeaders'] | undefined;
                    config?: T | undefined;
                  }
                | undefined
            ) =>
              fetch<Methods_1g8nz8q['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              ).json(),
            $get: (
              option?:
                | {
                    headers?: Methods_1g8nz8q['get']['reqHeaders'] | undefined;
                    config?: T | undefined;
                  }
                | undefined
            ) =>
              fetch<Methods_1g8nz8q['get']['resBody']>(
                prefix,
                prefix2,
                GET,
                option
              )
                .json()
                .then(r => r.body),
            $path: () => `${prefix}${prefix2}`
          };
        }
      }
    }
  };
};

export type ApiInstance = ReturnType<typeof api>;
export default api;
