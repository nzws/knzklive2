import { Tenant, User } from '@prisma/client';
import { USERNAME_REGEX } from 'utils/constants';
import { checkDomain } from 'utils/domain';
import { prisma } from 'utils/prisma';

const DEFAULT_DOMAIN = process.env.DEFAULT_FRONT_DOMAIN || '';

export const tenantGet = async (
  id?: number,
  slug?: string,
  customDomain?: string,
  owner?: User
): Promise<Tenant | undefined> => {
  const tenant = await prisma.tenant.findUnique({
    where: {
      id,
      slug,
      customDomain,
      ...(owner && { owner: { id: owner.id } })
    }
  });

  return tenant || undefined;
};

export const tenantGetDomain = (tenant: Tenant): string =>
  tenant.customDomain || `${tenant.slug}.${DEFAULT_DOMAIN}`;

export const tenantGetSlugOrCustomDomain = (domain: string) => {
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

export type TenantPublic = {
  id: number;
  slug: string;
  ownerId: number;
  displayName?: string;
  customDomain?: string;
};

export const tenantGetAsPublic = (tenant: Tenant): TenantPublic => ({
  id: tenant.id,
  slug: tenant.slug,
  ownerId: tenant.ownerId,
  displayName: tenant.displayName || undefined,
  customDomain: tenant.customDomain || undefined
});

export const tenantCreate = async (
  slug: string,
  owner: User
): Promise<Tenant> => {
  if (!USERNAME_REGEX.test(slug)) {
    throw new Error('Invalid slug');
  }

  const tenant = await prisma.tenant.create({
    data: {
      slug,
      config: {},
      owner: {
        connect: {
          id: owner.id
        }
      }
    }
  });

  return tenant;
};

export const tenantUpdateCustomDomain = async (
  tenant: Tenant,
  customDomain: string | null
): Promise<Tenant> => {
  if (customDomain && !checkDomain(customDomain)) {
    throw new Error('Invalid domain');
  }

  const tenantUpdated = await prisma.tenant.update({
    where: { id: tenant.id },
    data: { customDomain }
  });

  return tenantUpdated;
};
