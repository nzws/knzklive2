import { AuthorizationHeader } from '../../../../common/types';

// https://docs.joinmastodon.org/methods/statuses/

export enum MastodonStatusVisibility {
  Public = 'public',
  Unlisted = 'unlisted',
  Private = 'private',
  Direct = 'direct'
}

export type Methods = {
  post: {
    reqHeaders: AuthorizationHeader;
    reqBody: {
      status: string;
      visibility?: MastodonStatusVisibility;
    };
    resBody: {
      id: string;
      created_at: string;
      content: string;
    };
  };
};
