import { importJWK, JWK, jwtVerify } from 'jose';

const expire = 60 * 1 * 1000; // 1 minutes
const ISSUER = 'github.com/nzws/knzklive2';

export class Jwt {
  timestamp?: number;

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
    const key = await this.getCache();
    if (key) {
      return key;
    }

    return this.getOrigin();
  }

  private async getCache(): Promise<JWK | undefined> {
    const cache = await caches.open('jwt');
    const cached = await cache.match(this.url);

    if (cached) {
      const fetchedAt = cached.headers.get('X-FetchedAt');
      if (!fetchedAt || parseInt(fetchedAt, 10) + expire < Date.now()) {
        return;
      }

      const json = await cached.json();

      return json as JWK;
    }
  }

  private async getOrigin(): Promise<JWK> {
    const response = await fetch(this.url);
    if (!response.ok) {
      console.warn(await response.json());
      throw new Error('failed to fetch jwk');
    }
    const json = await response.json();

    const copy = response.clone();
    const headers = new Headers(copy.headers);
    headers.append('X-FetchedAt', Date.now().toString());

    const cache = await caches.open('jwt');
    await cache.put(this.url, new Response(JSON.stringify(json), { headers }));

    return json as JWK;
  }
}
