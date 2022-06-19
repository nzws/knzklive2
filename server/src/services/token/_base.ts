import * as jose from 'jose';
import type { KeyLike } from 'jose';
import { alg } from './key';

export const ISSUER = 'https://live.knzk.me';

export class Token {
  private publicKey?: KeyLike;
  private privateKey?: KeyLike;

  constructor(
    private readonly publicKeyStr: string,
    private readonly privateKeyStr: string,
    private readonly subject: string,
    private readonly expirationTime: string
  ) {}

  protected async sign(payload: jose.JWTPayload): Promise<string> {
    const privateKey = await this.getPrivateKey();
    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer(ISSUER)
      .setSubject(this.subject)
      .setExpirationTime(this.expirationTime)
      .sign(privateKey);

    return jwt;
  }

  protected async verify(jwt: string): Promise<jose.JWTPayload> {
    const publicKey = await this.getPublicKey();
    const { payload } = await jose.jwtVerify(jwt, publicKey, {
      issuer: ISSUER,
      subject: this.subject
    });

    return payload;
  }

  private async getPublicKey(): Promise<KeyLike> {
    if (this.publicKey) {
      return this.publicKey;
    }

    const publicKey = (await jose.importJWK(
      JSON.parse(this.publicKeyStr) as jose.JWK,
      alg
    )) as KeyLike;

    this.publicKey = publicKey;
    return publicKey;
  }

  private async getPrivateKey(): Promise<KeyLike> {
    if (this.privateKey) {
      return this.privateKey;
    }

    const privateKey = (await jose.importJWK(
      JSON.parse(this.privateKeyStr) as jose.JWK,
      alg
    )) as KeyLike;

    this.privateKey = privateKey;
    return privateKey;
  }
}
