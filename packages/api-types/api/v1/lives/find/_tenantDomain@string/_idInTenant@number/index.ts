import { LivePublic } from 'server/src/models/live';
import { AuthorizationHeader } from '../../../../../../common/types';

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    resBody: LivePublic;
  };
};
