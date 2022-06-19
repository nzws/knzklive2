export type APIRequestBody<R> = {
  path: string;
  query?: Record<string, string>;
  body?: Record<string, unknown>;
  token?: string;
  _responseBody?: R & never;
};

export type RequestWithToken<R> = APIRequestBody<R> | undefined;
export type RequestAsAnonymous<R> = APIRequestBody<R>;

export type ParamsWithToken<P> = [P, string | undefined];
export type ParamsAsAnonymous<P> = [P];
export type NoParamsWithToken = [string | undefined];
