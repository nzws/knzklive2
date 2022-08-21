import type { Command } from '@dotplants/cli';
import { createKeyPair } from '../services/token/key';

export const generateKeys: Command = {
  description: 'generate keys',
  function: async () => {
    const userToken = await createKeyPair();

    console.log('Add to your env:');
    console.log(
      [
        `USER_TOKEN_PUBLIC_KEY="${userToken.publicKey}"`,
        `USER_TOKEN_PRIVATE_KEY="${userToken.privateKey}"`
      ].join('\n')
    );
  }
};
