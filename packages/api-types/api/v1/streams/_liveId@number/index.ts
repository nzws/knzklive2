import { LivePrivate, LiveStats } from 'api-types/common/types';
import { AuthorizationHeader } from '../../../../common/types';
import { LiveSetting } from '../index';

export type Methods = {
  patch: {
    reqHeaders: AuthorizationHeader;

    reqBody: Partial<Omit<LiveSetting, 'hashtag' | 'isRecording'>>;

    resBody: {
      success: boolean;
    };
  };

  get: {
    reqHeaders: AuthorizationHeader;

    resBody: {
      live: LivePrivate;
      stats: LiveStats;
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
