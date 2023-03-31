import crypto from 'crypto';
import isValidDomain from 'is-valid-domain';
import { AuthProvider, ExternalUser, RelationData } from './_base';

type MisskeyApiError = {
  error: unknown;
};

type MisskeyApiMiAuthSessionCheck = {
  token: string;
  user: unknown;
};

type MisskeyApiAccount = {
  id: string;
  username: string;
  name: string;
  avatarUrl: string;
};

// https://github.com/misskey-dev/misskey/blob/26068a3a8ffcd6cc787ff7fe15ccdd4a4bf0ae32/packages/backend/src/server/api/endpoints/users/relation.ts
type MisskeyApiUsersRelation = {
  id: string;
  isFollowing: boolean;
  isFollowed: boolean;
};

// https://misskey-hub.net/docs/api/permission.html
const scopes = ['read:following', 'read:account', 'write:notes'];

const uuidV4Regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// docs: https://misskey-hub.net/docs/api
export class AuthMisskey extends AuthProvider {
  private readonly domain: string;

  constructor(domain: string) {
    domain = domain.toLowerCase();
    if (!isValidDomain(domain)) {
      throw new Error('Invalid domain');
    }

    super('misskey');
    this.domain = domain;
  }

  getAuthUrl(): Promise<string> {
    const session = this.createSession();

    const query = this.objToQueryString({
      name: 'KnzkLive2',
      icon: 'https://knzk.live/static/surprized_knzk.png',
      callback: this.redirectUrl,
      permission: scopes.join(',')
    });

    return Promise.resolve(`https://${this.domain}/miauth/${session}?${query}`);
  }

  async getToken(session: string): Promise<string> {
    if (!this.checkIsValidSession(session)) {
      throw new Error('Invalid session');
    }

    const response = await fetch(
      `https://${this.domain}/api/miauth/${session}/check`,
      {
        method: 'POST'
      }
    );
    console.log('[AuthMisskey]', response.url, response.status);
    const body = (await response.json()) as
      | MisskeyApiMiAuthSessionCheck
      | MisskeyApiError;

    if (!response.ok || !('token' in body)) {
      console.warn(body);
      throw new Error('Failed to get token');
    }

    return body.token;
  }

  async getUser(token: string): Promise<ExternalUser> {
    const response = await fetch(`https://${this.domain}/api/i`, {
      method: 'POST',
      body: JSON.stringify({
        i: token
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('[AuthMisskey]', response.url, response.status);
    const body = (await response.json()) as MisskeyApiAccount | MisskeyApiError;
    if (!response.ok || 'error' in body || !body.username) {
      console.warn(body);
      throw new Error('Failed to get user');
    }

    return {
      account: `${body.username}@${this.domain}`.toLowerCase(),
      displayName: body.name,
      avatarUrl: body.avatarUrl
    };
  }

  async revokeToken(): Promise<void> {
    // :shrug:
  }

  async getInternalUserIdFromAcct(
    token: string,
    acct: string
  ): Promise<string> {
    const [username, host] = acct.split('@');
    if (!host || !username) {
      throw new Error('Invalid acct');
    }

    const response = await fetch(`https://${this.domain}/api/users/show`, {
      method: 'POST',
      body: JSON.stringify({
        i: token,
        username,
        host
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('[AuthMisskey]', response.url, response.status);
    const body = (await response.json()) as MisskeyApiAccount;
    if (!response.ok || 'error' in body || !body.id) {
      console.warn(body);
      throw new Error('Failed to get user');
    }

    return body.id;
  }

  async getRelation(token: string, targetId: string): Promise<RelationData> {
    const response = await fetch(`https://${this.domain}/api/users/relation`, {
      method: 'POST',
      body: JSON.stringify({
        userId: targetId,
        i: token
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('[AuthMisskey]', response.url, response.status);
    const body = (await response.json()) as
      | MisskeyApiUsersRelation
      | MisskeyApiError;
    if (!response.ok || 'error' in body) {
      console.warn(body);
      throw new Error('Failed to get relation');
    }

    return {
      following: body.isFollowing,
      follower: body.isFollowed
    };
  }

  private createSession(): string {
    return crypto.randomUUID();
  }

  private checkIsValidSession(session: string): boolean {
    return uuidV4Regex.test(session);
  }
}
