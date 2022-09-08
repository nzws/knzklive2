import { CommentPublic } from 'server/src/models/comment';
import { APIError, AuthorizationHeader } from '../../../../../common/types';

export type Methods = {
  get: {
    resBody: CommentPublic[] | APIError;
  };

  post: {
    reqHeaders: AuthorizationHeader;

    reqBody: {
      content: string;
    };

    resBody: CommentPublic | APIError;
  };

  delete: {
    reqHeaders: AuthorizationHeader;

    reqBody: {
      id: number;
    };

    resBody:
      | {
          success: boolean;
        }
      | APIError;
  };
};
