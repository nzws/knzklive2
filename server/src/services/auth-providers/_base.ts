export type ExternalUser = {
  account: string; // 全プラットフォームの中でユニークになる ID (e.g. nzws@don.nzws.me, nzws_me@twitter.com)
  displayName?: string;
  avatarUrl?: string;
};

const endpoint = process.env.SERVER_ENDPOINT || '';

export abstract class AuthProvider {
  protected readonly redirectUrl: string;

  constructor(type: string) {
    this.redirectUrl = `${endpoint}/v1/auth/${type}/callback`;
  }

  protected objToQueryString(obj: Record<string, string>): string {
    return Object.entries(obj)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  }

  abstract getAuthUrl(): Promise<string>;

  abstract getToken(code: string): Promise<string>;

  abstract getUser(token: string): Promise<ExternalUser>;
}
