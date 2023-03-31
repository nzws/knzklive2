import { redis } from './_client';

// サーバーで採番された id のキャッシュ
// hash key: userId / field: domain / value: internalId

export class InternalUserIdCache {
  private readonly key: string;

  constructor(userId: number) {
    this.key = `internalUserId:${userId}`;
  }

  async get(domain: string) {
    const data = await redis.hget(this.key, domain);

    return data;
  }

  async set(domain: string, internalId: string) {
    await redis.hset(this.key, domain, internalId);
    await redis.expire(this.key, 60 * 60 * 24 * 14);
  }
}
