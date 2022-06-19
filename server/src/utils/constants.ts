export const GITHUB_URL = 'https://github.com/nzws/live';
export const USERNAME_REGEX = /[a-z0-9_]+/;

export const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
};
