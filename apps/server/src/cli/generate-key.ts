import * as jose from 'jose';
import crypto from 'crypto';
import type { Command } from '@dotplants/cli';
import { alg } from '../services/jwt/_base';

export const generateKey: Command = {
  description: 'generate key',
  function: async () => {
    const { publicKey, privateKey } = await jose.generateKeyPair(alg);

    const publicKeyStr = Buffer.from(
      JSON.stringify(await jose.exportJWK(publicKey))
    ).toString('base64');
    const privateKeyStr = Buffer.from(
      JSON.stringify(await jose.exportJWK(privateKey))
    ).toString('base64');
    const token = crypto.randomBytes(48).toString('hex');

    console.log(
      [
        `JWT_EDGE_PRIVATE_KEY="${privateKeyStr}"`,
        `JWT_EDGE_PUBLIC_KEY="${publicKeyStr}"`,
        `SERVER_TOKEN="${token}"`
      ].join('\n')
    );
    process.exit(0);
  }
};
