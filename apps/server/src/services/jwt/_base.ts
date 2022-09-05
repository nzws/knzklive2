import * as jose from 'jose';
import type { KeyLike } from 'jose';

export const ISSUER = 'github.com/nzws/knzklive2';
export const alg = 'EdDSA';

export class JWT {
  private publicKey?: KeyLike;
  private privateKey?: KeyLike;

  constructor(
    private readonly subject: string,
    private readonly expirationTime: string
  ) {}

  async generateKeyPair() {
    const { publicKey, privateKey } = await jose.generateKeyPair(alg);

    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  exportPublicKey(): Promise<jose.JWK> {
    if (!this.publicKey) {
      throw new Error('publicKey is not initialized');
    }

    return jose.exportJWK(this.publicKey);
  }

  protected async sign(payload: jose.JWTPayload): Promise<string> {
    if (!this.privateKey) {
      throw new Error('privateKey is not initialized');
    }
    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer(ISSUER)
      .setSubject(this.subject)
      .setExpirationTime(this.expirationTime)
      .sign(this.privateKey);

    return jwt;
  }

  protected async verify(jwt: string): Promise<jose.JWTPayload> {
    if (!this.publicKey) {
      throw new Error('publicKey is not initialized');
    }

    const { payload } = await jose.jwtVerify(jwt, this.publicKey, {
      issuer: ISSUER,
      subject: this.subject
    });

    return payload;
  }
}
