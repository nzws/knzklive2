import { APIError } from '../../../../../common/types';

export type Methods = {
  post: {
    reqBody: {
      domain: string;
      token: string;
    };

    resBody: { liveToken: string } | APIError;
  };
};
