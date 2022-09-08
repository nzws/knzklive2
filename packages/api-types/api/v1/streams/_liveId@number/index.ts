import { LivePublic, StreamStatus } from 'server/src/models/live';
import { APIError, AuthorizationHeader } from '../../../../common/types';
import { LiveSetting } from '../index';

export type Methods = {
  patch: {
    reqHeaders: AuthorizationHeader;

    reqBody: Partial<LiveSetting>;

    resBody:
      | {
          success: boolean;
        }
      | APIError;
  };

  get: {
    reqHeaders: AuthorizationHeader;

    resBody:
      | {
          live: LivePublic;

          push: {
            status: StreamStatus;
          };
        }
      | APIError;
  };
};
