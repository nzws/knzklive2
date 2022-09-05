import type { PrismaClient, Tenant, User } from '@prisma/client';
import { checkDomain } from '../utils/domain';

export type TenantPublic = {
  id: number;
  slug: string;
  ownerId: number;
  displayName?: string;
  customDomain?: string;
};

export const Tenants = (prismaTenant: PrismaClient['tenant']) =>
  Object.assign(prismaTenant, {
    get: async (
      id?: number,
      slug?: string,
      customDomain?: string,
      ownerId?: number
    ): Promise<Tenant | undefined> => {
      const tenant = await prismaTenant.findUnique({
        where: {
          id,
          slug,
          customDomain,
          ...(ownerId && { owner: { id: ownerId } })
        }
      });

      return tenant || undefined;
    },
    getPublic: (tenant: Tenant): TenantPublic => ({
      id: tenant.id,
      slug: tenant.slug,
      ownerId: tenant.ownerId,
      displayName: tenant.displayName || undefined,
      customDomain: tenant.customDomain || undefined
    }),
    create: async (slug: string, owner: User): Promise<Tenant> => {
      const tenant = await prismaTenant.create({
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
    },
    updateCustomDomain: async (
      tenant: Tenant,
      customDomain: string | null
    ): Promise<Tenant> => {
      if (customDomain && !checkDomain(customDomain)) {
        throw new Error('Invalid domain');
      }

      const tenantUpdated = await prismaTenant.update({
        where: { id: tenant.id },
        data: { customDomain }
      });

      return tenantUpdated;
    }
  });
