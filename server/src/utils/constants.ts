export const GITHUB_URL = 'https://github.com/nzws/knzklive2';
export const USERNAME_REGEX = /[a-z0-9_]+/;
export const DEFAULT_DOMAIN = process.env.DEFAULT_FRONT_DOMAIN || '';

export const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
};
