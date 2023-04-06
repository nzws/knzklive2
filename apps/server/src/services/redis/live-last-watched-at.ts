import { redis } from './_client';

// 配信の最終視聴日時のキャッシュ
// hash field: liveId / value: watchedAt

export class LiveLastWatchedAt {
  private readonly key: string;

  constructor() {
    this.key = `internalUserId`;
  }

  async get(liveId: number) {
    const data = await redis.hget(this.key, liveId.toString());
    if (!data) {
      return undefined;
    }

    return new Date(parseInt(data));
  }

  async set(liveId: number, watchedAt: Date) {
    await redis.hset(
      this.key,
      liveId.toString(),
      watchedAt.getTime().toString()
    );
  }
}
