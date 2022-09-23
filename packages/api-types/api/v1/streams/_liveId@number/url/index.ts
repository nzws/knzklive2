import { AuthorizationHeader } from '../../../../../common/types';

export type Methods = {
  get: {
    reqHeaders: AuthorizationHeader;

    resBody: {
      rtmp: {
        url: string;
        streamKey: string;
      };
      websocket: {
        url: string;
      };
    };
  };
};
