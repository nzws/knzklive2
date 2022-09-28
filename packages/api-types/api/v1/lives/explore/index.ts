import { LivePublic } from 'api-types/common/types';
import { AuthorizationHeader } from '../../../../common/types';

type LiveItem = LivePublic & {
  watchingCurrentCount: number;
};

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    resBody: LiveItem[];
  };
};
