import { AuthorizationHeader } from '../../../../../common/types';

export type LiveUrls = {
  flv: string;
  hlsHq: string;
  hlsLq: string;
  audio: string;
};

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    resBody: LiveUrls;
  };
};
