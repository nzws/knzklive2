import crypto from 'crypto';
import isValidDomain from 'is-valid-domain';
import { AuthProvider, ExternalUser } from './_base';

type MisskeyApiError = {
  error: unknown;
};

type MisskeyApiMiAuthSessionCheck = {
  token: string;
  user: unknown;
};

type MisskeyApiMyAccount = {
  username: string;
  name: string;
  avatarUrl: string;
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
    const body = (await response.json()) as
      | MisskeyApiMyAccount
      | MisskeyApiError;
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

  private createSession(): string {
    return crypto.randomUUID();
  }

  private checkIsValidSession(session: string): boolean {
    return uuidV4Regex.test(session);
  }
}
