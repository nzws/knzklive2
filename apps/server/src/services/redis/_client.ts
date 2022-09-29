import Redis from 'ioredis';

export const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const family = process.env.REDIS_USE_IPV6 ? 6 : 4;

export const redis = new Redis(redisUrl, {
  family
});
