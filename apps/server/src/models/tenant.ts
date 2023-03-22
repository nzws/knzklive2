import type { PrismaClient, Tenant, User } from '@prisma/client';
import { TenantConfig, TenantPublic } from 'api-types/common/types';
import { tenants } from '.';
import { prisma } from './_client';

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
    getByOwnerId: async (ownerId: number): Promise<Tenant[]> => {
      const tenant = await prismaTenant.findMany({
        where: {
          ownerId
        }
      });

      return tenant;
    },
    getPublic: (tenant: Tenant): TenantPublic => ({
      id: tenant.id,
      slug: tenant.slug,
      ownerId: tenant.ownerId,
      displayName: tenant.displayName || undefined
    }),
    getConfig: (tenant: Tenant): TenantConfig => {
      const config = (tenant.config || {}) as TenantConfig;

      return {
        exploreInOtherTenants: config.exploreInOtherTenants ?? true,
        webhookUrl: config.webhookUrl || undefined
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
    },
    createTenantByInvite: async (
      slug: string,
      owner: User,
      inviteId: string
    ): Promise<Tenant> => {
      return await prisma.$transaction(async tx => {
        const invite = await tx.invite.findUnique({
          where: {
            inviteId
          }
        });

        if (!invite) {
          throw new NoInviteError();
        }

        if (invite.usedById) {
          throw new InviteAlreadyUsedError();
        }

        await tenants.checkIsValidSlug(slug);

        const tenant = await tx.tenant.create({
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

        await tx.invite.update({
          where: {
            inviteId: invite.inviteId
          },
          data: {
            usedById: owner.id,
            tenantId: tenant.id,
            usedAt: new Date()
          }
        });

        return tenant;
      });
    },
    checkIsValidSlug: async (slug: string): Promise<boolean> => {
      const newSlug = slug.toLowerCase();

      if (!slugRegex.test(newSlug)) {
        throw new InvalidSlugError();
      }

      const tenant = await tenants.get(undefined, newSlug);
      if (tenant) {
        throw new SlugAlreadyUsedError();
      }

      return true;
    }
  });

export class NoInviteError extends Error {
  constructor() {
    super('Invite not found');
  }
}

export class InviteAlreadyUsedError extends Error {
  constructor() {
    super('Invite already used');
  }
}

export class InvalidSlugError extends Error {
  constructor() {
    super('Invalid slug');
  }
}

export class SlugAlreadyUsedError extends Error {
  constructor() {
    super('Slug already used');
  }
}

const slugRegex = /^[a-z0-9]+$/;
