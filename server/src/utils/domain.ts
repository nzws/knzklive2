import type { Tenant } from '@prisma/client';
import isValidDomain from 'is-valid-domain';
import { DEFAULT_DOMAIN } from './constants';

export const checkDomain = (domain: string): boolean => {
  if (process.env.NODE_ENV === 'development') {
    // ポート
    domain = domain.split(':')[0] as string;

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

  if (domain.endsWith(DEFAULT_DOMAIN)) {
    return {
      slug: domain.split('.')[0]
    };
  }

  return {
    customDomain: domain
  };
};
