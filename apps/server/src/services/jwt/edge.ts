import { JWT } from './_base';

export class JWTEdge extends JWT {
  constructor() {
    super('edge', '10m');
  }
}
