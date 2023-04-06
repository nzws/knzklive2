import { AuthorizationHeader } from '../../../../../common/types';

export type LiveUrls = {
  flv: string;
  hlsHq: string;
  hlsLq: string;
  audio: string;
};

export type PlaybackUrls = {
  hlsHq?: string;
};

export type LiveResponse = {
  live: LiveUrls;
};

export type PlaybackResponse = {
  playback: PlaybackUrls;
};

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    resBody: LiveResponse | PlaybackResponse;
  };
};
