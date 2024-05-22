import { JWT } from './_base';

export class JWTEdge extends JWT {
  constructor() {
    super(
      'edge',
      process.env.JWT_EDGE_PRIVATE_KEY || '',
      process.env.JWT_EDGE_PUBLIC_KEY || ''
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
