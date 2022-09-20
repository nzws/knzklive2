import {
  AuthorizationHeader,
  CommentPublic
} from '../../../../../common/types';

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

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
