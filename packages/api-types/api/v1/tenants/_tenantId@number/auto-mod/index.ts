import {
  CommentAutoModPrivate,
  AuthorizationHeader,
  CommentAutoModType
} from '../../../../../common/types';

export type Methods = {
  get: {
    reqHeaders: AuthorizationHeader;

    resBody: CommentAutoModPrivate[];
  };

  post: {
    reqHeaders: AuthorizationHeader;

    reqBody: {
      type: CommentAutoModType;
      value: string;
    };

    resBody: {
      success: boolean;
    };
  };
};
