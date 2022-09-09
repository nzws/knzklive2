import { Live, Tenant } from '@prisma/client';
import { APIError } from 'api-types/common/types';
import type { DefaultContext, DefaultState, Middleware } from 'koa';
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
  ResponseBody | APIError
>;

export type UserState = {
  user: UserPrivate;
};

export type TenantState = {
  tenant: Tenant;
};

export type LiveState = {
  live: Live;
};
