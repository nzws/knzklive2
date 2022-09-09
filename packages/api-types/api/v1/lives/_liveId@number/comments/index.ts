import { CommentPublic } from 'server/src/models/comment';
import { AuthorizationHeader } from '../../../../../common/types';

export type Methods = {
  get: {
    resBody: CommentPublic[];
  };

  post: {
    reqHeaders: AuthorizationHeader;

    reqBody: {
      content: string;
    };

    resBody: CommentPublic;
  };

  delete: {
    reqHeaders: AuthorizationHeader;

    reqBody: {
      id: number;
    };

    resBody: {
      success: boolean;
    };
  };
};
