import { JWT } from './_base';

type Payload = {
  liveId: number;
};

export class JWTCommentViewer extends JWT {
  constructor() {
    super('comment-viewer');
  }

  async generateToken(liveId: number): Promise<string> {
    return this.sign(
      {
        liveId
      },
      '1d'
    );
  }

  async verifyToken(token: string, liveId: number): Promise<boolean> {
    try {
      const payload = await this.verify(token);

      return (payload as Payload).liveId === liveId;
    } catch (e) {
      return false;
    }
  }
}
