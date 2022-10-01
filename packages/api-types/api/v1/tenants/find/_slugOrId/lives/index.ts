import {
  AuthorizationHeader,
  LivePublic
} from '../../../../../../common/types';

type LiveItem = LivePublic & {
  watchingCurrentCount?: number;
};

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    query?: {
      page?: number;
    };

    resBody: {
      lives: LiveItem[];
      hasNext: boolean;
    };
  };
};
