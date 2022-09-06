import { importJWK, JWK, jwtVerify } from 'jose';

const expire = 60 * 1 * 1000; // 1 minutes
const ISSUER = 'github.com/nzws/knzklive2';

export class Jwt {
  timestamp?: number;
  cache?: JWK;

  constructor(private readonly url: string, private readonly subject: string) {}

  async verify(token: string): Promise<Record<string, unknown> | undefined> {
    try {
      const jwk = await this.getKey();
      const publicKey = await importJWK(jwk);

      const { payload } = await jwtVerify(token, publicKey, {
        issuer: ISSUER,
        subject: this.subject
      });

      return payload;
    } catch (e) {
      console.error(e);

      return;
    }
  }

  async getKey(): Promise<JWK> {
    const key = this.getCache();
    if (key) {
      return key;
    }

    return this.getOrigin();
  }

  private getCache(): JWK | undefined {
    if (this.cache) {
      if (!this.timestamp || this.timestamp + expire < Date.now()) {
        return;
      }

      return this.cache;
    }
  }

  private async getOrigin(): Promise<JWK> {
    const response = await fetch(this.url);
    const json = (await response.json()) as JWK;

    this.cache = json;
    this.timestamp = Date.now();

    return json;
  }
}
