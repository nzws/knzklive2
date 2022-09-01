import type { DefaultContext, DefaultState, Middleware } from 'koa';
import { TenantPublic } from '../models/tenant';
import { UserPrivate } from '../models/user';

export type APIRoute<
  Params = never,
  GETParam = never,
  PostBody = never,
  ResponseBody = unknown,
  State = DefaultState
> = Middleware<
  State,
  DefaultContext & {
    params: Record<Extract<Params, string>, string>;
    request: {
      body: PostBody;
      query: GETParam;
    };
  },
  ResponseBody | { errorCode?: string }
>;

export type UserState = {
  user: UserPrivate;
};

export type TenantState = {
  tenant: TenantPublic;
};
