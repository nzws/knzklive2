import type { Tenant } from '@prisma/client';
import isValidDomain from 'is-valid-domain';
import { DEFAULT_DOMAIN } from './constants';

export const checkDomain = (domain: string): boolean => {
  if (process.env.NODE_ENV === 'development') {
    // ポート
    domain = domain.split(':')[0];

    if (domain === 'localhost') {
      return true;
    }
  }

  return isValidDomain(domain);
};

export const getTenantPrimaryDomain = (tenant: Tenant): string =>
  tenant.customDomain || `${tenant.slug}.${DEFAULT_DOMAIN}`;

export const getSlugOrCustomDomain = (domain: string) => {
  domain = domain.toLowerCase();

  if (domain.endsWith(`.${DEFAULT_DOMAIN}`)) {
    return {
      slug: domain.split('.')[0]
    };
  }

  return {
    customDomain: domain
  };
};

export const getStreamUrl = (liveId: number, token: string) =>
  `${
    process.env.EDGE_ENDPOINT || ''
  }/streaming/${liveId}/stream?token=${token}`;
export const getHlsStreamUrl = (liveId: number, token: string) =>
  `http${process.env.USE_HTTP ? '' : 's'}://${
    process.env.PUSH_DOMAIN || ''
  }/live/${liveId}.m3u8?token=${token}`;

export const getPushUrl = () => `rtmp://${process.env.PUSH_DOMAIN || ''}/live`;
export const getPushStreamKey = (liveId: number, token: string) =>
  `${liveId}?token=${token}`;
