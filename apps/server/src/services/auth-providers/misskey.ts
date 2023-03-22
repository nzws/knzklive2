import crypto from 'crypto';
import isValidDomain from 'is-valid-domain';
import { AuthProvider, ExternalUser } from './_base';

type MisskeyApiError = {
  error: string;
};

type MisskeyApiMiAuthSeesionCheck = {
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
      scope: scopes.join(',')
    });

    return Promise.resolve(`https://${this.domain}/miauth/${session}?${query}`);
  }

  async getToken(session: string): Promise<string> {
    const response = await fetch(`https://${this.domain}/${session}/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const body = (await response.json()) as
      | MisskeyApiMiAuthSeesionCheck
      | MisskeyApiError;

    if (!response.ok || 'error' in body || !body.token) {
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
      })
    });
    const body = (await response.json()) as MisskeyApiMyAccount;
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
}
