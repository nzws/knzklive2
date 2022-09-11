import { LivePublic } from 'server/src/models/live';
import { AuthorizationHeader } from '../../../../common/types';
import { LiveSetting } from '../index';

export type Methods = {
  patch: {
    reqHeaders: AuthorizationHeader;

    reqBody: Partial<Omit<LiveSetting, 'hashtag' | 'privacy'>>;

    resBody: {
      success: boolean;
    };
  };

  get: {
    reqHeaders: AuthorizationHeader;

    resBody: {
      live: LivePublic;

      push: {
        status: 'Provisioning' | 'Ready' | 'Live' | 'Paused' | 'Ended';
      };
    };
  };
};
