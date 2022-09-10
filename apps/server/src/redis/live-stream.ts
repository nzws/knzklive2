import { redis } from './_client';

export class LiveStream {
  async add(liveId: number, ip: string) {
    await this.remove(liveId, ip);
    await redis.lpush(this.getKey(liveId), ip);
  }

  async get(liveId: number) {
    const ips = await redis.lrange(this.getKey(liveId), 0, -1);

    if (!ips) {
      return;
    }

    return ips;
  }

  async removeAll(liveId: number) {
    await redis.del(this.getKey(liveId));
  }

  async remove(liveId: number, ip: string) {
    await redis.lrem(this.getKey(liveId), 0, ip);
  }

  private getKey(liveId: number) {
    return `liveStream:${liveId}`;
  }
}
