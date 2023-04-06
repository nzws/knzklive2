import { AuthorizationHeader } from '../../../../../common/types';

export type Methods = {
  post: {
    reqHeaders?: AuthorizationHeader;

    reqBody: {
      status: 'playing' | 'paused' | 'ended';
      seek: number;
    };

    resBody: {
      success: boolean;
    };
  };
};
