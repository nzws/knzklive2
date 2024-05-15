import { AuthorizationHeader } from '../../../../../common/types';

export type Methods = {
  get: {
    reqHeaders: AuthorizationHeader;

    resBody: {
      rtmp: {
        unsecure_url: string;
        secure_url: string | undefined;
        streamKey: string;
      };
      websocket: {
        url: string;
      };
    };
  };
};
