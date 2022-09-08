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
  'tenant_invalid',
  'tenant_not_found',
  'user_not_found',
  'invalid_user_id',
  'invalid_authorization_type'
] as const;
type ErrorCode = typeof errorCodes[number];

export interface APIError {
  errorCode: ErrorCode;
}
