import crypto from 'crypto';
import { redis } from './_client';

const tokenExpire = 60 * 60 * 24 * 7;

export class UserToken {
  async create(userId: number) {
    const token = crypto.randomBytes(48).toString('hex');

    await redis.set(token, userId, 'EX', tokenExpire);
  }

  async get(token: string) {
    const userId = await redis.get(token);

    if (!userId) {
      return;
    }

    return parseInt(userId, 10);
  }
}
