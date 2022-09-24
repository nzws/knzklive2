import { LiveConfig, LivePublic } from 'api-types/common/types';
import { AuthorizationHeader } from '../../../common/types';

export type LiveSetting = {
  title: string;
  description?: string;
  privacy: 'Public' | 'Private';
  sensitive: boolean;
  hashtag?: string;
  config: LiveConfig;
  customThumbnailId?: number;
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
