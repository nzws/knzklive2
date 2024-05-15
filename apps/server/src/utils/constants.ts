export const GITHUB_URL = 'https://github.com/nzws/knzklive2';
export const USERNAME_REGEX = /[a-z0-9_]+/;

export const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
};

export const PROTOCOL = `http${process.env.USE_HTTP ? '' : 's'}`;
export const basePushStream = `${PROTOCOL}://${process.env.PUSH_DOMAIN || ''}`;
export const enableVideo = !!process.env.VIDEO_DOMAIN;
export const baseVideoStream = `${PROTOCOL}://${
  process.env.VIDEO_DOMAIN || ''
}`;
export const basePushPlay = `${PROTOCOL}://${
  process.env.PUSH_CDN_DOMAIN || process.env.PUSH_DOMAIN || ''
}`;
export const baseVideoPlay = `${PROTOCOL}://${
  process.env.VIDEO_CDN_DOMAIN || process.env.VIDEO_DOMAIN || ''
}`;
export const frontendUrl = process.env.FRONTEND_ENDPOINT || '';
export const pushDomain = (process.env.PUSH_DOMAIN || '').split(':')[0];

export const getPushStreamKey = (
  liveId: number,
  pushToken: string,
  watchToken?: string
) =>
  watchToken
    ? `${liveId}_${watchToken}?token=${pushToken}`
    : `${liveId}?token=${pushToken}`;

export const getPushWebsocketUrl = (
  liveId: number,
  pushToken: string,
  watchToken?: string
) =>
  `ws${process.env.USE_HTTP ? '' : 's'}://${
    process.env.PUSH_DOMAIN || ''
  }/api/externals/websocket/v1/stream-push/${liveId}?token=${pushToken}&watchToken=${
    watchToken || ''
  }`;

export const serverToken = process.env.SERVER_TOKEN || '';

export const getPublicLiveUrl = (slug: string, idInTenant: number) =>
  `${frontendUrl}/@${slug}/${idInTenant}`;
