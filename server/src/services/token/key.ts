import * as jose from 'jose';

export const alg = 'EdDSA';

export const createKeyPair = async (): Promise<{
  publicKey: string;
  privateKey: string;
}> => {
  const { publicKey, privateKey } = await jose.generateKeyPair(alg);

  const publicJwk = await jose.exportJWK(publicKey);
  const privateJwk = await jose.exportJWK(privateKey);

  const base64PublicKey = Buffer.from(
    JSON.stringify(publicJwk),
    'utf8'
  ).toString('base64');
  const base64PrivateKey = Buffer.from(
    JSON.stringify(privateJwk),
    'utf8'
  ).toString('base64');

  return { publicKey: base64PublicKey, privateKey: base64PrivateKey };
};
