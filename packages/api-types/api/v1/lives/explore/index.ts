import { LivePublic } from 'server/src/models/live';
import { APIError } from '../../../../common/types';

export type Methods = {
  get: {
    resBody: LivePublic[] | APIError;
  };
};
