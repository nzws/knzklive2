export const GITHUB_URL = 'https://github.com/nzws/knzklive2';
export const USERNAME_REGEX = /[a-z0-9_]+/;
export const DEFAULT_DOMAIN = process.env.DEFAULT_FRONT_DOMAIN || '';

export const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
};

export const PROTOCOL = `http${process.env.USE_HTTP ? '' : 's'}`;
export const basePushStream = `${PROTOCOL}://${process.env.PUSH_DOMAIN || ''}`;
export const getPushUrl = () => `rtmp://${process.env.PUSH_DOMAIN || ''}/live`;
export const getPushStreamKey = (
  liveId: number,
  pushToken: string,
  watchToken?: string
) =>
  watchToken
    ? `${liveId}_${watchToken}?token=${pushToken}`
    : `${liveId}?token=${pushToken}`;

export const serverToken = process.env.SERVER_TOKEN || '';
