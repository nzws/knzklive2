export interface AuthorizationHeader {
  Authorization: string;
}

const errorCodes = [
  'unauthorized',
  'invalid_request',
  'not_found',
  'forbidden',
  'internal_server_error',
  'invalid_response_from_provider',
  'live_not_found',
  'tenant_not_found',
  'user_not_found',
  'invalid_authorization_type',
  'forbidden_live',
  'live_already_ended',
  'live_not_ended'
] as const;
type ErrorCode = (typeof errorCodes)[number];

export interface APIError {
  errorCode: ErrorCode;
  message?: string;
}

export type CommentPublic = {
  id: number;
  liveId: number;
  userId: number;
  createdAt: Date;
  content: string;
  sourceUrl?: string;
  isDeleted: boolean;
  isHidden: boolean;
};

export type CommentAutoModType = 'Account' | 'Domain' | 'Text';

export type CommentAutoModPrivate = {
  id: number;
  type: CommentAutoModType;
  value: string;
};

export type LiveConfig = {
  preferThumbnailType?: 'generate' | 'custom';
  // 視聴者が配信者をフォロー
  isRequiredFollowing?: boolean;
  // 配信者が視聴者をフォロー
  isRequiredFollower?: boolean;
};

export type LivePrivacy = 'Public' | 'Private';

export type LivePublic = {
  id: number;
  idInTenant: number;
  userId: number;
  startedAt?: Date;
  endedAt?: Date;
  title: string;
  description?: string;
  sensitive: boolean;
  privacy: LivePrivacy;
  hashtag?: string;
  watchingSumCount?: number;
  isPushing: boolean;
  publicUrl: string;
  tenant: TenantPublic;
  thumbnail?: ImagePublic;
  isRequiredFollowing: boolean;
  isRequiredFollower: boolean;
};

export type LivePrivate = LivePublic & {
  config: Required<LiveConfig>;
};

export type TenantConfig = {
  exploreInOtherTenants?: boolean;
  webhookUrl?: string;
};

export type TenantPublic = {
  id: number;
  slug: string;
  ownerId: number;
  displayName?: string;
};

export type InvitePublic = {
  inviteId: string;
  createdBy?: number;
  usedBy?: number;
};

export type UserConfig = {
  //
};

export type UserPrivate = UserPublic & {
  config: Required<UserConfig>;
};

export type UserPublic = {
  id: number;
  account: string;
  displayName?: string;
  avatarUrl?: string;
};

export type ImagePublic = {
  id: number;
  publicUrl: string;
};
