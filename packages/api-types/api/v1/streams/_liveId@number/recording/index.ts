import { AuthorizationHeader } from '../../../../../common/types';

export type Methods = {
  post: {
    reqHeaders: AuthorizationHeader;

    resBody: {
      success: boolean;
    };
  };

  // todo: not implemented
  delete: {
    reqHeaders: AuthorizationHeader;

    resBody: {
      success: boolean;
    };
  };
};
