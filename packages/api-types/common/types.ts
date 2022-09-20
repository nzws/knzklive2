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
  'live_already_ended'
] as const;
type ErrorCode = typeof errorCodes[number];

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
};

export type LivePublic = {
  id: number;
  idInTenant: number;
  userId: number;
  tenantId: number;
  startedAt?: Date;
  endedAt?: Date;
  title: string;
  description?: string;
  sensitive: boolean;
  privacy: 'Public' | 'Private';
  hashtag?: string;
  watchingSumCount?: number;
  isPushing: boolean;
};

export type TenantConfig = {
  autoRedirectInTopPage?: boolean;
  exploreInOtherTenants?: boolean;
};

export type TenantPublic = {
  id: number;
  slug: string;
  ownerId: number;
  displayName?: string;
  customDomain?: string;
  domain: string;
};

export type UserConfig = {
  //
};

export type UserPrivate = UserPublic & {
  config: UserConfig;
};

export type UserPublic = {
  id: number;
  account: string;
  displayName?: string;
  avatarUrl?: string;
};
