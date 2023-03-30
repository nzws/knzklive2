import { AuthorizationHeader } from '../../../../../../common/types';

export type Methods = {
  delete: {
    reqHeaders: AuthorizationHeader;

    resBody: {
      success: boolean;
    };
  };
};
