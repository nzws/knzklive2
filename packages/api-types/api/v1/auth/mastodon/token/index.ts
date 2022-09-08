import { APIError } from '../../../../../common/types';

export type Methods = {
  post: {
    reqBody: {
      domain: string;
      code: string;
    };

    resBody:
      | {
          mastodonToken: string;
          liveToken: string;
        }
      | APIError;
  };
};
