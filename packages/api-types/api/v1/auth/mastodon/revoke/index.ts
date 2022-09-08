import { APIError } from '../../../../../common/types';

export type Methods = {
  post: {
    reqBody: {
      domain?: string;
      mastodonToken?: string;
      liveToken?: string;
    };

    resBody: { success: boolean } | APIError;
  };
};
