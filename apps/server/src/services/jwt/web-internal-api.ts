import { JWT } from './_base';

export class JWTWebInternalAPI extends JWT {
  constructor() {
    super('web-internal-api');
  }

  async generateToken(payload: string): Promise<string> {
    return this.sign(
      {
        payload
      },
      '10m'
    );
  }
}
