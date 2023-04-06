import { AuthProviderType } from '@prisma/client';
import isValidDomain from 'is-valid-domain';
import { authProviders } from '../../models';
import { GITHUB_URL } from '../../utils/constants';
import { AuthProvider, ExternalUser, RelationData } from './_base';

type MastodonApiError = {
  error: string;
};

type MastodonApiV1Apps = {
  client_id?: string;
  client_secret?: string;
};

type MastodonOauthToken = {
  access_token?: string;
};

type MastodonApiV1AccountsVerifyCredentials = {
  id?: string;
  username?: string;
  acct?: string;
  display_name?: string;
  avatar?: string;
  url?: string;
};

type MastodonApiV1Accounts = {
  id?: string;
  username?: string;
  acct?: string;
  display_name?: string;
  avatar?: string;
  url?: string;
};

type MastodonApiV1AccountsRelationships = {
  id: string;
  following: boolean;
  followed_by: boolean;
}[];

const scopes = ['read:follows', 'read:accounts', 'write:statuses'];

// docs: https://docs.joinmastodon.org/methods/apps/oauth/
export class AuthMastodon extends AuthProvider {
  private readonly domain: string;

  constructor(domain: string) {
    domain = domain.toLowerCase();
    if (!isValidDomain(domain)) {
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
    console.log('[AuthMastodon]', response.url, response.status);
    const body = (await response.json()) as
      | MastodonOauthToken
      | MastodonApiError;

    if (!response.ok || 'error' in body || !body.access_token) {
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
    console.log('[AuthMastodon]', response.url, response.status);
    const body =
      (await response.json()) as MastodonApiV1AccountsVerifyCredentials;
    if (!response.ok || 'error' in body || !body.username) {
      console.warn(body);
      throw new Error('Failed to get user');
    }

    return {
      account: `${body.username}@${this.domain}`.toLowerCase(),
      displayName: body.display_name,
      avatarUrl: body.avatar,
      url: body.url
    };
  }

  async revokeToken(token: string): Promise<void> {
    const { clientId, clientSecret } = await this._getClient(false);

    const response = await fetch(`https://${this.domain}/oauth/revoke`, {
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
    console.log('[AuthMastodon]', response.url, response.status);
  }

  async getInternalUserIdFromAcct(
    token: string,
    acct: string
  ): Promise<string> {
    const query = this.objToQueryString({
      acct
    });

    const response = await fetch(
      `https://${this.domain}/api/v1/accounts/lookup?${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        method: 'GET'
      }
    );
    console.log('[AuthMastodon]', response.url, response.status);
    const body = (await response.json()) as MastodonApiV1Accounts;
    if (!response.ok || 'error' in body || !body.id) {
      console.warn(body);
      throw new Error('Failed to get user');
    }

    return body.id;
  }

  async getRelation(token: string, targetId: string): Promise<RelationData> {
    const response = await fetch(
      `https://${this.domain}/api/v1/accounts/relationships?id=${targetId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        method: 'GET'
      }
    );
    console.log('[AuthMastodon]', response.url, response.status);
    const body = (await response.json()) as MastodonApiV1AccountsRelationships;
    if (!response.ok || 'error' in body || body.length !== 1) {
      console.warn(body);
      throw new Error('Failed to get relation');
    }
    const relation = body[0];

    return {
      following: relation.following,
      follower: relation.followed_by
    };
  }

  async _getClient(
    enableRegister: boolean
  ): Promise<{ clientId: string; clientSecret: string }> {
    const client = await authProviders.get(this.domain);
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
    console.log('[AuthMastodon]', response.url, response.status);

    const body = (await response.json()) as
      | MastodonApiV1Apps
      | MastodonApiError;
    if (!response.ok || 'error' in body) {
      console.warn(body);
      throw new Error('Failed to create client');
    }
    if (!body.client_id || !body.client_secret) {
      console.warn(body);
      throw new Error('Invalid response');
    }

    console.log(`Created client for ${this.domain}`);

    await authProviders.createClient(
      this.domain,
      body.client_id,
      body.client_secret
    );

    return { clientId: body.client_id, clientSecret: body.client_secret };
  }
}
