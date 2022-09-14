import { redis } from './_client';

export class LiveWatching {
  async startWatching(liveId: number, ip: string) {
    await redis.sadd(this.getCurrentKey(liveId), ip);
    await redis.sadd(this.getSumKey(liveId), ip);

    await redis.expire(this.getCurrentKey(liveId), 60 * 60 * 24 * 14);
    await redis.expire(this.getSumKey(liveId), 60 * 60 * 24 * 14);
  }

  async stopWatching(liveId: number, ip: string) {
    await redis.srem(this.getCurrentKey(liveId), 0, ip);
  }

  async get(liveId: number) {
    return {
      current: await redis.scard(this.getCurrentKey(liveId)),
      sum: await redis.scard(this.getSumKey(liveId))
    };
  }

  async stopLive(liveId: number) {
    await redis.del(this.getCurrentKey(liveId), this.getSumKey(liveId));
  }

  private getCurrentKey(liveId: number) {
    return `liveWatching:${liveId}:current`;
  }

  private getSumKey(liveId: number) {
    return `liveWatching:${liveId}:sum`;
  }
}
