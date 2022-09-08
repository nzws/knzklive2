import { LivePrivacy, LivePublic } from 'server/src/models/live';
import { APIError, AuthorizationHeader } from '../../../common/types';

export type LiveSetting = {
  title: string;
  description?: string;
  privacy: LivePrivacy;
  sensitive: boolean;
  hashtag?: string;
};

export type Methods = {
  post: {
    reqHeaders: AuthorizationHeader;

    reqBody: LiveSetting & {
      tenantId: number;
    };

    resBody:
      | {
          live: LivePublic;
        }
      | APIError;
  };
};
