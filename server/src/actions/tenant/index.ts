import { Tenant, User } from '@prisma/client';
import isValidDomain from 'is-valid-domain';
import { USERNAME_REGEX } from 'utils/constants';
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

export const updateCustomDomain = async (
  tenant: Tenant,
  customDomain: string | null
): Promise<Tenant> => {
  if (customDomain && !isValidDomain(customDomain)) {
    throw new Error('Invalid domain');
  }

  const tenantUpdated = await prisma.tenant.update({
    where: { id: tenant.id },
    data: { customDomain }
  });

  return tenantUpdated;
};
