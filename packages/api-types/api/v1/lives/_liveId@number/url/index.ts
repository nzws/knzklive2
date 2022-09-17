import { AuthorizationHeader } from '../../../../../common/types';

export type PlayUrl = {
  wsFlv: string;
  hls?: string;
  mp3?: string;
};

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    resBody: PlayUrl;
  };
};
