import { RelationData } from '../auth-providers/_base';
import { redis } from './_client';

// FF情報のキャッシュ
// hash key: streamerId / field: userId / value: RelationCacheData
//
// API 叩く時は userId から見た値を取得するので、
// following=userIdがstreamerIdをフォローしているかどうか / follower=streamerIdがuserIdをフォローしているかどうか となる
//
// userId/streamerId は KnzkLive で採番した id

export interface RelationCacheData extends RelationData {
  lastUpdatedAt: number;
}

export class RelationCache {
  private readonly key: string;

  constructor(streamerId: number) {
    this.key = `relations:${streamerId}`;
  }

  async isFresh(userId: number) {
    const data = await this.get(userId);
    if (!data) {
      return false;
    }

    const now = this.getTimestamp();
    // 1分以内は新鮮なデータとみなす
    return now - data.lastUpdatedAt < 60;
  }

  async get(userId: number) {
    const data = await redis.hget(this.key, userId.toString());

    if (!data) {
      return undefined;
    }

    return JSON.parse(data) as RelationCacheData;
  }

  async set(userId: number, data: RelationData) {
    const item = {
      ...data,
      lastUpdatedAt: this.getTimestamp()
    };

    await redis.hset(this.key, userId.toString(), JSON.stringify(item));
    await redis.expire(this.key, 60 * 60 * 24 * 14);
  }

  async reset() {
    await redis.del(this.key);
  }

  private getTimestamp() {
    return Math.floor(Date.now() / 1000);
  }
}
