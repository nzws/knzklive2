import { APIError, AuthorizationHeader } from '../../../../../common/types';

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    resBody:
      | {
          wsFlv: string;
        }
      | APIError;
  };
};
