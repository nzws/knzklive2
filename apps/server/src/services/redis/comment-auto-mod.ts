import { CommentAutoModPrivate } from 'api-types/common/types';
import { commentAutoMods } from '../../models';
import { redis } from './_client';

// CommentAutoMod cache
// list: CommentAutoModPrivate[]

const NO_DATA_FLAG = '__NO_DATA__';

export class CommentAutoModCache {
  private readonly key: string;

  constructor(private tenantId: number) {
    this.key = this.getKey(tenantId);
  }

  async get(): Promise<CommentAutoModPrivate[]> {
    const isExist = await redis.exists(this.key);
    if (!isExist) {
      return this.updateCache();
    }

    const list = await redis.lrange(this.key, 0, -1);
    if (list[0] === NO_DATA_FLAG) {
      return [];
    }
    return list.map(x => JSON.parse(x) as CommentAutoModPrivate);
  }

  async updateCache() {
    console.log(`[CommentAutoMod] updateCache(${this.tenantId})`);
    await this.removeCache();

    const list = (await commentAutoMods.getList(this.tenantId)).map(x =>
      commentAutoMods.getPrivate(x)
    );

    if (list.length === 0) {
      await redis.rpush(this.key, NO_DATA_FLAG);
    } else {
      await redis.rpush(this.key, ...list.map(x => JSON.stringify(x)));
    }
    await redis.expire(this.key, 60 * 60 * 24);

    return list;
  }

  private async removeCache() {
    await redis.del(this.key);
  }

  private getKey(tenantId: number) {
    return `commentAutoMod:${tenantId}`;
  }
}
