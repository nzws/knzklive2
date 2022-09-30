import { importJWK, JWK, jwtVerify, JWTPayload } from 'jose';
import { baseURL } from './api/client';

const expire = 60 * 10 * 1000;

type APIResponse = {
  publicKey: JWK;
  alg: string;
  issuer: string;
};

export class Jwt {
  timestamp?: number;
  cache?: APIResponse;

  constructor(private readonly url: string, private readonly subject: string) {}

  async verify(token: string): Promise<JWTPayload | undefined> {
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

class WebJWT extends Jwt {
  constructor() {
    super(`${baseURL}/v1/internals/web-internal/jwt`, 'web-internal-api');
  }

  async check(token: string, encorded: string): Promise<boolean> {
    const payload = (await this.verify(token)) as {
      payload: string;
    };
    if (!payload || payload.payload !== encorded) {
      return false;
    }

    return true;
  }
}

export const webJWT = new WebJWT();
