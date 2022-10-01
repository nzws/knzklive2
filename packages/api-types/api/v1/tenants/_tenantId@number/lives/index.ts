import { AuthorizationHeader, LivePrivate } from '../../../../../common/types';

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    query?: {
      page?: number;
    };

    resBody: {
      lives: LivePrivate[];
      hasNext: boolean;
    };
  };
};
