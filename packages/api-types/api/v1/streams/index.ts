import { LiveConfig, LivePrivacy, LivePublic } from 'api-types/common/types';
import { AuthorizationHeader } from '../../../common/types';

export type LiveSetting = {
  title: string;
  description?: string;
  privacy: LivePrivacy;
  sensitive: boolean;
  hashtag?: string;
  config: LiveConfig;
  customThumbnailId?: number;
  isRecording: boolean;
};

export type Methods = {
  post: {
    reqHeaders: AuthorizationHeader;

    reqBody: LiveSetting & {
      tenantId: number;
    };

    resBody: {
      live: LivePublic;
    };
  };
};
