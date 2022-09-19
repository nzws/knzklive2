import { AuthorizationHeader } from '../../../../../common/types';

export type PlayUrl = {
  flv: string;
  hls: string;
  aac: string;
};

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    resBody: PlayUrl;
  };
};
