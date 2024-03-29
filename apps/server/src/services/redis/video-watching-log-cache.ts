import { redis } from './_client';

// 動画の視聴ログのキャッシュ

type VideoWatchingLog = {
  status: 'playing' | 'paused' | 'ended';
  seek: number;
  createdAt: number;
};

export class VideoWatchingLogCache {
  constructor(private liveId: number) {}

  async getActiveCount(accurate = false) {
    const keys = await redis.keys(this.getKey('*'));
    if (keys.length === 0) {
      return 0;
    }

    if (!accurate) {
      return keys.length;
    }

    // 最初と最後が10秒以上離れていれば見たとみなす
    let count = 0;

    for (const key of keys) {
      const raw = await redis.lrange(key, 0, -1);
      const logs = raw.map(r => JSON.parse(r) as VideoWatchingLog);
      if (logs.length <= 1) {
        continue;
      }

      const first = logs[0];
      const last = logs[logs.length - 1];

      if (last.createdAt - first.createdAt > 10000) {
        count++;
      }
    }

    return count;
  }

  async cleanupAll() {
    const keys = await redis.keys(this.getKey('*'));
    if (keys.length === 0) {
      return;
    }
    await redis.del(...keys);
  }

  async insert(
    ip: string,
    status: 'playing' | 'paused' | 'ended',
    seek: number
  ) {
    const key = this.getKey(ip);
    await redis.rpush(
      key,
      JSON.stringify({
        status,
        seek,
        createdAt: Date.now()
      } as VideoWatchingLog)
    );
    // 毎日データベースに集計する
    await redis.expire(key, 60 * 60 * 24 * 2);
  }

  private getKey(ip: string) {
    return `videoWatchingLog:${this.liveId}:${ip}`;
  }

  static async getAllActiveLiveIds() {
    const keys = await redis.keys('videoWatchingLog:*');
    const ids = keys.map(key => parseInt(key.split(':')[1]));

    return Array.from(new Set(ids));
  }
}
