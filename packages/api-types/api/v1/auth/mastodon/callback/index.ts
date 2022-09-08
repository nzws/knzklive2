import { APIError } from '../../../../../common/types';

export type Methods = {
  post: {
    reqBody: {
      code: string;
    };

    resBody: undefined | APIError;
  };
};
