import crypto from 'crypto';
import { redis } from './_client';

const tokenExpire = 60 * 60 * 24 * 7;

export class UserToken {
  async create(userId: number) {
    const token = crypto.randomBytes(48).toString('hex');

    await redis.set(this.getKey(token), userId, 'EX', tokenExpire);

    return token;
  }

  async get(token: string) {
    const userId = await redis.get(this.getKey(token));

    if (!userId) {
      return;
    }

    void redis.expire(this.getKey(token), tokenExpire);
    return parseInt(userId, 10);
  }

  async revoke(token: string) {
    await redis.del(this.getKey(token));
  }

  private getKey(token: string) {
    return `userToken:${token}`;
  }
}
