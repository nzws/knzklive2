import { Image, Live, Tenant, User } from '@prisma/client';
import { APIError } from 'api-types/common/types';
import type { DefaultContext, DefaultState, Middleware } from 'koa';

export type APIRoute<
  Params = never,
  GETParam = never,
  PostBody = never,
  ResponseBody = unknown,
  State = DefaultState
> = Middleware<
  State & UserIdState,
  DefaultContext & {
    params: Record<Extract<Params, string>, string>;
    request: {
      body: PostBody;
      query: GETParam;
    };
  },
  ResponseBody | APIError
>;

export type UserState = {
  user: User;
};

export type TenantState = {
  tenant: Tenant;
};

export type LiveState = {
  live: Live & {
    thumbnail: Image | null;
    tenant: Tenant;
  };
};

export type UserIdState = {
  userId?: number;
};
