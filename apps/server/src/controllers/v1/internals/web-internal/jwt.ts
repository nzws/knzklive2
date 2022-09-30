import { Middleware } from 'koa';
import { jwtWebInternalAPI } from '../../../../services/jwt';
import { alg, ISSUER } from '../../../../services/jwt/_base';

export const getV1InternalsWebInternalJwt: Middleware = async ctx => {
  const publicKey = await jwtWebInternalAPI.exportPublicKey();

  ctx.body = {
    publicKey,
    alg,
    issuer: ISSUER
  };
};
