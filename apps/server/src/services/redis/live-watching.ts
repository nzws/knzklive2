import { redis } from './_client';

// 視聴者数のリアルタイムカウント
// field: ip / value: timestamp

export class LiveWatching {
  lastCleanup = this.getTimestamp();

  async signal(liveId: number, ip: string) {
    try {
      await this.cleanup(liveId);
    } catch (e) {
      console.error(e);
    }

    await redis.hset(this.getKey(liveId), ip, this.getTimestamp());
  }

  async get(liveId: number) {
    const data = await redis.hgetall(this.getKey(liveId));
    const ips = Object.keys(data);
    const current = ips.filter(key => parseInt(data[key]) !== -1);

    return {
      current: current.length,
      sum: ips.length
    };
  }

  async stopLive(liveId: number) {
    await redis.del(this.getKey(liveId));
  }

  async cleanup(liveId: number) {
    const now = this.getTimestamp();
    if (now - this.lastCleanup < 30) {
      return;
    }
    this.lastCleanup = now;

    const data = await redis.hgetall(this.getKey(liveId));

    const outdated = Object.keys(data).filter(
      key => now - parseInt(data[key]) > 30
    );
    if (outdated.length > 0) {
      await redis.hset(
        this.getKey(liveId),
        ...outdated.flatMap(key => [key, '-1'])
      );
    }
    await redis.expire(this.getKey(liveId), 60 * 60 * 24 * 14);
  }

  private getKey(liveId: number) {
    return `liveWatching:${liveId}`;
  }

  private getTimestamp() {
    return Math.floor(Date.now() / 1000);
  }
}
