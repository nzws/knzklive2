import { AuthProviderType } from '@prisma/client';
import { authProviderCreate, authProviderGet } from 'actions/auth-provider';
import fetch from 'node-fetch';
import { GITHUB_URL } from 'utils/constants';
import { checkDomain } from 'utils/domain';
import { AuthProvider, ExternalUser } from './_base';

type MastodonApiV1Apps = {
  // 200
  client_id?: string;
  client_secret?: string;
  // 422
  error?: string;
};

type MastodonOauthToken = {
  // 200
  access_token?: string;
  // 4xx
  error?: string;
  error_description?: string;
};

type MastodonApiV1AccountsVerifyCredentials = {
  // 200
  id?: string;
  username?: string;
  acct?: string;
  display_name?: string;
  avatar?: string;
  // 4xx
  error?: string;
};

const scopes = ['read:follows', 'read:accounts', 'write:statuses'];

// docs: https://docs.joinmastodon.org/methods/apps/oauth/
export class AuthMastodon extends AuthProvider {
  private readonly domain: string;

  constructor(domain: string) {
    domain = domain.toLowerCase();
    if (!checkDomain(domain)) {
      throw new Error('Invalid domain');
    }

    super('mastodon');
    this.domain = domain;
  }

  async getAuthUrl(): Promise<string> {
    const { clientId } = await this._getClient(true);

    const query = this.objToQueryString({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: this.redirectUrl,
      scope: scopes.join('+')
    });

    return `https://${this.domain}/oauth/authorize?${query}`;
  }

  async getToken(code: string): Promise<string> {
    const { clientId, clientSecret } = await this._getClient(false);

    const response = await fetch(`https://${this.domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: this.redirectUrl,
        scope: scopes.join(' '),
        code
      })
    });
    const body = (await response.json()) as MastodonOauthToken;

    if (!response.ok || !body.access_token) {
      console.warn(body);
      throw new Error('Failed to get token');
    }

    return body.access_token;
  }

  async getUser(token: string): Promise<ExternalUser> {
    const response = await fetch(
      `https://${this.domain}/api/v1/accounts/verify_credentials`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        method: 'GET'
      }
    );
    const body =
      (await response.json()) as MastodonApiV1AccountsVerifyCredentials;
    if (!response.ok || body.error || !body.username) {
      console.warn(body);
      throw new Error('Failed to get user');
    }

    return {
      account: `${body.username}@${this.domain}`.toLowerCase(),
      displayName: body.display_name,
      avatarUrl: body.avatar
    };
  }

  async revokeToken(token: string): Promise<void> {
    const { clientId, clientSecret } = await this._getClient(false);

    await fetch(`https://${this.domain}/oauth/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        token
      })
    });
  }

  async _getClient(
    enableRegister: boolean
  ): Promise<{ clientId: string; clientSecret: string }> {
    const client = await authProviderGet(this.domain);
    if (client && client.type !== AuthProviderType.Mastodon) {
      throw new Error('Invalid auth provider');
    }

    if (!client && enableRegister) {
      const client = await this._createClient();
      return { clientId: client.clientId, clientSecret: client.clientSecret };
    } else if (!client) {
      throw new Error('Failed to get client');
    }

    return { clientId: client.clientId, clientSecret: client.clientSecret };
  }

  async _createClient(): Promise<{ clientId: string; clientSecret: string }> {
    const response = await fetch(`https://${this.domain}/api/v1/apps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_name: 'KnzkLive Platform',
        website: GITHUB_URL,
        redirect_uris: this.redirectUrl,
        scopes: scopes.join(' ')
      })
    });

    const body = (await response.json()) as MastodonApiV1Apps;
    if (!response.ok || body.error) {
      console.warn(body);
      throw new Error('Failed to create client');
    }
    if (!body.client_id || !body.client_secret) {
      console.warn(body);
      throw new Error('Invalid response');
    }

    console.log(`Created client for ${this.domain}`);

    await authProviderCreate(this.domain, body.client_id, body.client_secret);

    return { clientId: body.client_id, clientSecret: body.client_secret };
  }
}
