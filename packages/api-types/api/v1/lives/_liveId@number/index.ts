import { LivePublic } from 'api-types/common/types';
import { AuthorizationHeader } from '../../../../common/types';

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    resBody: LivePublic;
  };
};
