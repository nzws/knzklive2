import { UserPublic } from 'server/src/models/user';
import { APIError } from '../../../../common/types';

export type Methods = {
  get: {
    resBody: UserPublic | APIError;
  };
};
