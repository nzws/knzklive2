import {
  AuthorizationHeader,
  CommentPublic
} from '../../../../../common/types';

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    query?: {
      viewerToken?: string;
    };

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

    query: {
      commentId: string;
    };

    resBody: {
      success: boolean;
    };
  };
};
