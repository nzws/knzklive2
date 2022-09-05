import { JWT } from './_base';

export class JWTEdge extends JWT {
  constructor() {
    super('edge', '10m');
  }

  async generateToken(
    type: 'stream' | 'push',
    liveId: number
  ): Promise<string> {
    return this.sign({
      type,
      liveId
    });
  }
}
