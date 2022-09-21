import { AuthorizationHeader } from '../../../../../common/types';

export type PlayUrl = {
  flv: string;
  hlsHq: string;
  hlsLq: string;
  audio: string;
};

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    resBody: PlayUrl;
  };
};
