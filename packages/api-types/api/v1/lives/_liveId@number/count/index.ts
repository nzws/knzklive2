import { AuthorizationHeader } from '../../../../../common/types';

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    resBody: {
      current: number;
      sum: number;
    };
  };
};
