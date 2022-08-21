import type { DefaultContext, DefaultState, Middleware } from 'koa';
import type { UserPayload } from '@server/services/token/user-token';

export type APIRoute<
  Params = never,
  GETParam = never,
  PostBody = never,
  ResponseBody = unknown,
  State = DefaultState
> = Middleware<
  State,
  DefaultContext & {
    params: Params extends string ? Record<Params, string> : never;
    request: {
      body: PostBody;
      query: GETParam;
    };
  },
  ResponseBody | { errorCode?: string }
>;

export type APIRouteWithAuth<
  Params = never,
  GETParam = never,
  PostBody = never,
  ResponseBody = unknown
> = APIRoute<
  Params,
  GETParam,
  PostBody,
  ResponseBody,
  {
    user: UserPayload;
  }
>;
