import { redis } from './_client';

type LiveBitrate = {
  recv_30s: number;
  send_30s: number;
  createdAt: number;
};

export class LiveBitrateStats {
  private key: string;
  constructor(liveId: number) {
    this.key = `liveBitrate:${liveId}`;
  }

  async remove() {
    await redis.del(this.key);
  }

  async insert(recv_30s: number, send_30s: number) {
    await redis.rpush(
      this.key,
      JSON.stringify({
        recv_30s,
        send_30s,
        createdAt: Date.now()
      } satisfies LiveBitrate)
    );

    // 最新100件だけ残す
    await redis.ltrim(this.key, -100, -1);

    await redis.expire(this.key, 60 * 60 * 24);
  }

  async getAll() {
    const raw = await redis.lrange(this.key, 0, -1);
    return raw.map(r => JSON.parse(r) as LiveBitrate);
  }

  async getLatest() {
    const raw = await redis.lrange(this.key, -1, -1);
    const latest = raw[0];
    if (!latest) {
      return undefined;
    }

    return JSON.parse(latest) as LiveBitrate;
  }
}
