import * as jose from 'jose';
import type { KeyLike } from 'jose';

export const ISSUER = 'github.com/nzws/knzklive2';
export const alg = 'EdDSA';

export class JWT {
  private publicKey?: KeyLike;
  private privateKey?: KeyLike;

  constructor(private readonly subject: string) {}

  async getKey(): Promise<{ publicKey: KeyLike; privateKey: KeyLike }> {
    if (!this.publicKey || !this.privateKey) {
      const { publicKey, privateKey } = await jose.generateKeyPair(alg);

      this.publicKey = publicKey;
      this.privateKey = privateKey;

      return { publicKey, privateKey };
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

    return jwt;
  }

  async verify(jwt: string): Promise<jose.JWTPayload> {
    const { publicKey } = await this.getKey();

    const { payload } = await jose.jwtVerify(jwt, publicKey, {
      issuer: ISSUER,
      subject: this.subject
    });

    return payload;
  }
}
