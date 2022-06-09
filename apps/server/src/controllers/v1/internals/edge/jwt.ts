import { Middleware } from 'koa';
import { jwtEdge } from '../../../../services/jwt';

export const getV1InternalsEdgeJwt: Middleware = async ctx => {
  const publicKey = await jwtEdge.exportPublicKey();

  ctx.body = publicKey;
};
