import { AuthorizationHeader } from '../../../../../common/types';

export type Methods = {
  post: {
    reqHeaders?: AuthorizationHeader;

    reqBody: {
      // server type が増えたらここも増やす必要アリ
      mastodonToken?: string;
      misskeyToken?: string;
    };

    resBody: { success: boolean };
  };
};
