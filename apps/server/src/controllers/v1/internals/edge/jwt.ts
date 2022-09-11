import { Middleware } from 'koa';
import { jwtEdge } from '../../../../services/jwt';
import { alg, ISSUER } from '../../../../services/jwt/_base';

export const getV1InternalsEdgeJwt: Middleware = async ctx => {
  const publicKey = await jwtEdge.exportPublicKey();

  ctx.body = {
    publicKey,
    alg,
    issuer: ISSUER
  };
};
