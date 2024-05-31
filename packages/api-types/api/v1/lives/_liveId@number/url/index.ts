import { AuthorizationHeader } from '../../../../../common/types';

export type LiveUrls = {
  flvWs: string;
  flvHttp: string;
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
