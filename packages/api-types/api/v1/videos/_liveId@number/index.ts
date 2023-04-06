import { AuthorizationHeader } from '../../../../common/types';

export type PlaybackTimestamp = {
  startedAt: string;
  endedAt: string;
  duration: number;
};

export type VideoUrls = {
  hlsHq?: string;
};

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    resBody: {
      url: VideoUrls;
      isCacheDeleted: boolean;
      isOriginalDeleted: boolean;
      watchCount: number;

      timestamps: PlaybackTimestamp[];
    };
  };
};
