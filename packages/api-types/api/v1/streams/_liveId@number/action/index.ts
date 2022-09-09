import { AuthorizationHeader } from '../../../../../common/types';

export type Methods = {
  post: {
    reqHeaders: AuthorizationHeader;

    reqBody: {
      command: 'publish' | 'end';
    };

    resBody: {
      success: boolean;
    };
  };
};
