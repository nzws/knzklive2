import { JWT } from './_base';

export class JWTEdge extends JWT {
  constructor() {
    super(
      'edge',
      process.env.JWT_EDGE_PRIVATE_KEY || '',
      process.env.JWT_EDGE_PUBLIC_KEY || ''
    );
  }

  async generateTokenAsPush(liveId: number): Promise<string> {
    return this.sign(
      {
        type: 'push',
        liveId
      },
      '1d'
    );
  }

  async generateTokenAsStream(liveId: number): Promise<string> {
    return this.sign(
      {
        type: 'stream',
        liveId
      },
      '1d'
    );
  }
}
