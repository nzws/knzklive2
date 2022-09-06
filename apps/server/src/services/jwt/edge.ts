import { JWT } from './_base';

export class JWTEdge extends JWT {
  constructor() {
    super('edge');
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
