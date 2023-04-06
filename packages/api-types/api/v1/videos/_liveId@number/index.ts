import { AuthorizationHeader } from '../../../../common/types';

export type PlaybackTimestamp = {
  startedAt: string;
  endedAt: string;
};

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    resBody: {
      url: {
        hlsHq?: string;
      };
      isCacheDeleted: boolean;
      isOriginalDeleted: boolean;
      watchCount: number;

      timestamps: PlaybackTimestamp[];
    };
  };
};
