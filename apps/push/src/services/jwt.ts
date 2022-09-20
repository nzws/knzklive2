import { importJWK, JWK, jwtVerify } from 'jose';
import { baseURL } from '../utils/api';

const expire = 60 * 60 * 24 * 7 * 1000; // 7 days

type APIResponse = {
  publicKey: JWK;
  alg: string;
  issuer: string;
};

type Payload = {
  type: 'stream' | 'push';
  liveId: number;
};

export class Jwt {
  timestamp?: number;
  cache?: APIResponse;

  constructor(private readonly url: string, private readonly subject: string) {}

  async verify(token: string): Promise<Payload | undefined> {
    try {
      const data = await this.getKey();
      const publicKey = await importJWK(data.publicKey, data.alg);

      const { payload } = await jwtVerify(token, publicKey, {
        issuer: data.issuer,
        subject: this.subject
      });

      return payload as Payload;
    } catch (e) {
      console.error(e);

      return;
    }
  }

  async getKey(): Promise<APIResponse> {
    const key = this.getCache();
    if (key) {
      return key;
    }

    return this.getOrigin();
  }

  private getCache(): APIResponse | undefined {
    if (this.cache) {
      if (!this.timestamp || this.timestamp + expire < Date.now()) {
        return;
      }

      return this.cache;
    }
  }

  private async getOrigin(): Promise<APIResponse> {
    const response = await fetch(this.url);
    if (!response.ok) {
      console.warn(await response.json());
      throw new Error('failed to fetch jwk');
    }
    const json = (await response.json()) as APIResponse;

    this.cache = json;
    this.timestamp = Date.now();

    return json;
  }
}

export const jwt = new Jwt(`${baseURL}/v1/internals/edge/jwt`, 'edge');
