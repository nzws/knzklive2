import { DefaultContext, DefaultState, Middleware, Request } from 'koa';

export type APIRoute<
  GETParam = never,
  PostBody = never,
  ResponseBody = unknown
> = Middleware<
  DefaultState,
  DefaultContext & {
    request: Request & {
      body: PostBody;
      query: GETParam;
    };
  },
  ResponseBody
>;
