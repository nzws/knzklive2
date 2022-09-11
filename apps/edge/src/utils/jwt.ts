import { importJWK, JWK, jwtVerify } from 'jose';

const expire = 60 * 60 * 24 * 7 * 1000; // 7 days

type APIResponse = {
  publicKey: JWK;
  alg: string;
  issuer: string;
};

export class Jwt {
  timestamp?: number;

  constructor(private readonly url: string, private readonly subject: string) {}

  async verify(token: string): Promise<Record<string, unknown> | undefined> {
    try {
      const data = await this.getKey();
      const publicKey = await importJWK(data.publicKey, data.alg);

      const { payload } = await jwtVerify(token, publicKey, {
        issuer: data.issuer,
        subject: this.subject
      });

      return payload;
    } catch (e) {
      console.error(e);

      return;
    }
  }

  async getKey(): Promise<APIResponse> {
    const key = await this.getCache();
    if (key) {
      return key;
    }

    return this.getOrigin();
  }

  private async getCache(): Promise<APIResponse | undefined> {
    const cache = await caches.open('jwt');
    const cached = await cache.match(this.url);

    if (cached) {
      const fetchedAt = cached.headers.get('X-FetchedAt');
      if (!fetchedAt || parseInt(fetchedAt, 10) + expire < Date.now()) {
        return;
      }

      const json = await cached.json();

      return json as APIResponse;
    }
  }

  private async getOrigin(): Promise<APIResponse> {
    const response = await fetch(this.url);
    if (!response.ok) {
      console.warn(this.url, await response.text());
      throw new Error('failed to fetch jwk');
    }

    const headers = new Headers();
    headers.append('X-FetchedAt', Date.now().toString());
    const json = await response.json();

    const cache = await caches.open('jwt');
    await cache.put(this.url, new Response(JSON.stringify(json), { headers }));

    return json as APIResponse;
  }
}
