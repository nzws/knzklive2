import { APIError } from '../../../../../common/types';

export type Methods = {
  get: {
    query: {
      tenantId: number;
      domain: string;
    };

    resBody: undefined | APIError;
  };
};
