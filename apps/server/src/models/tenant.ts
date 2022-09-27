import type { PrismaClient, Tenant, User } from '@prisma/client';
import { TenantConfig, TenantPublic } from 'api-types/common/types';

export const Tenants = (prismaTenant: PrismaClient['tenant']) =>
  Object.assign(prismaTenant, {
    get: async (id?: number, slug?: string): Promise<Tenant | undefined> => {
      const tenant = await prismaTenant.findUnique({
        where: {
          id,
          slug
        }
      });

      return tenant || undefined;
    },
    getPublic: (tenant: Tenant): TenantPublic => ({
      id: tenant.id,
      slug: tenant.slug,
      ownerId: tenant.ownerId,
      displayName: tenant.displayName || undefined
    }),
    getConfig: (tenant: Tenant): Required<TenantConfig> => {
      const config = (tenant.config || {}) as TenantConfig;

      return {
        autoRedirectInTopPage: config.autoRedirectInTopPage ?? true,
        exploreInOtherTenants: config.exploreInOtherTenants ?? true
      };
    },
    createTenant: async (slug: string, owner: User): Promise<Tenant> => {
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
    }
  });
