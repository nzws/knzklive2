import { LivePublic } from 'server/src/models/live';
import { AuthorizationHeader } from '../../../common/types';

export type LiveSetting = {
  title: string;
  description?: string;
  privacy: 'Public' | 'Private';
  sensitive: boolean;
  hashtag?: string;
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
