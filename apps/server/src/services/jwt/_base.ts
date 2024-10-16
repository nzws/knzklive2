import * as jose from 'jose';
import type { KeyLike } from 'jose';
import { logDebug } from '../../utils/logger';

export const ISSUER = 'github.com/nzws/knzklive2';
export const alg = 'PS256';

export class JWT {
  private publicKey?: KeyLike;
  private privateKey?: KeyLike;

  constructor(
    private readonly subject: string,
    private privateKeyStr?: string,
    private publicKeyStr?: string
  ) {}

  async getKey(): Promise<{ publicKey: KeyLike; privateKey: KeyLike }> {
    if (!this.publicKey || !this.privateKey) {
      if (this.publicKeyStr && this.privateKeyStr) {
        const privateKey = (await jose.importJWK(
          JSON.parse(
            Buffer.from(this.privateKeyStr, 'base64').toString()
          ) as jose.JWK,
          alg
        )) as KeyLike;
        const publicKey = (await jose.importJWK(
          JSON.parse(
            Buffer.from(this.publicKeyStr, 'base64').toString()
          ) as jose.JWK,
          alg
        )) as KeyLike;
        this.privateKey = privateKey;
        this.publicKey = publicKey;

        return { publicKey, privateKey };
      } else {
        const { publicKey, privateKey } = await jose.generateKeyPair(alg);
        this.privateKey = privateKey;
        this.publicKey = publicKey;

        return { publicKey, privateKey };
      }
    }

    return { publicKey: this.publicKey, privateKey: this.privateKey };
  }

  async exportPublicKey(): Promise<jose.JWK> {
    const { publicKey } = await this.getKey();

    return jose.exportJWK(publicKey);
  }

  protected async sign(
    payload: jose.JWTPayload,
    expirationTime: string
  ): Promise<string> {
    const { privateKey } = await this.getKey();

    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer(ISSUER)
      .setSubject(this.subject)
      .setExpirationTime(expirationTime)
      .sign(privateKey);

    /*
    try {
      const { payload } = await jose.jwtVerify(jwt, publicKey, {
        issuer: ISSUER,
        subject: this.subject
      });
      logDebug(this.subject, 'sign test passed', payload);
    } catch (e) {
      logDebug(this.subject, 'sign test failed', e);
    }
    */

    return jwt;
  }

  async verify(jwt: string): Promise<jose.JWTPayload | undefined> {
    try {
      const { publicKey } = await this.getKey();

      const { payload } = await jose.jwtVerify(jwt, publicKey, {
        issuer: ISSUER,
        subject: this.subject
      });

      return payload;
    } catch (e) {
      logDebug(this.subject, e);
      return undefined;
    }
  }
}
