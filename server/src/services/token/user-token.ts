import { User } from '@prisma/client';
import { Token } from './_base';

const publicKey = Buffer.from(
  process.env.USER_TOKEN_PUBLIC_KEY || '',
  'base64'
).toString('utf8');
const privateKey = Buffer.from(
  process.env.USER_TOKEN_PRIVATE_KEY || '',
  'base64'
).toString('utf8');

export type UserPayload = {
  id: number;
  account: string;
  displayName?: string;
  avatarUrl?: string;
};

export class UserToken extends Token {
  constructor() {
    super(publicKey, privateKey, 'user-token', '1d');
  }

  async getToken(user: User): Promise<string> {
    const payload: UserPayload = {
      id: user.id,
      account: user.account,
      displayName: user.displayName || undefined,
      avatarUrl: user.avatarUrl || undefined
    };

    return super.sign(payload);
  }

  async verifyToken(token: string): Promise<UserPayload> {
    return (await super.verify(token)) as UserPayload;
  }
}
