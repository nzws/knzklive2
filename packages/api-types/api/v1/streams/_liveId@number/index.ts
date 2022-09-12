import { LivePublic } from 'server/src/models/live';
import { AuthorizationHeader } from '../../../../common/types';
import { LiveSetting } from '../index';

export type Methods = {
  patch: {
    reqHeaders: AuthorizationHeader;

    reqBody: Partial<Omit<LiveSetting, 'hashtag'>>;

    resBody: {
      success: boolean;
    };
  };

  get: {
    reqHeaders: AuthorizationHeader;

    resBody: {
      live: LivePublic;
      pushFirstStartedAt?: Date;
      pushLastStartedAt?: Date;
      pushLastEndedAt?: Date;
    };
  };
};
