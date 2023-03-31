import { LivePrivacy, LivePublic } from 'api-types/common/types';
import { AuthorizationHeader } from '../../../../../../common/types';

export type LiveInitializePublicProps = {
  id: number;
  isAccessible: boolean;
  // isAccessible=true の場合のみ
  live?: LivePublic;
  privacy: LivePrivacy;
  isRequiredFollowing: boolean;
  isRequiredFollower: boolean;
};

export type Methods = {
  get: {
    reqHeaders?: AuthorizationHeader;

    resBody: LiveInitializePublicProps;
  };
};
