import { Tenant as SchemaTenant } from '@prisma/client';
import { prisma } from 'utils/prisma';

const domainRegex = /^[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$/;
const DEFAULT_SUFFIX = `.${process.env.DEFAULT_FRONT_DOMAIN || ''}`;

export class Tenant {
  private domain?: string;
  private tenant: SchemaTenant | null = null;

  constructor(private readonly id?: number, domain?: string) {
    if (!id && !domain) {
      throw new Error('Invalid tenant');
    }

    if (id && isNaN(id)) {
      throw new Error('Invalid tenantId');
    }

    if (domain) {
      domain = domain.toLowerCase();
      if (!domainRegex.test(domain)) {
        throw new Error('Invalid domain');
      }

      this.domain = domain;
    }
  }

  async getTenant(): Promise<SchemaTenant> {
    return await this._getTenant();
  }

  async isValidTenant(): Promise<boolean> {
    try {
      const tenant = await this._getTenant();

      return !!tenant;
    } catch (_) {
      return false;
    }
  }

  async _getTenant(): Promise<SchemaTenant> {
    if (this.tenant) {
      return this.tenant;
    }

    if (this.id) {
      const tenant = await prisma.tenant.findUnique({
        where: {
          id: this.id
        }
      });
      if (!tenant) {
        throw new Error('Invalid tenant');
      }
      this.tenant = tenant;

      return tenant;
    }

    if (this.domain && this.domain.endsWith(DEFAULT_SUFFIX)) {
      const [slug] = this.domain.split('.');

      const tenant = await prisma.tenant.findUnique({
        where: {
          slug
        }
      });
      if (!tenant) {
        throw new Error('Invalid tenant');
      }
      this.tenant = tenant;

      return tenant;
    }

    const tenant = await prisma.tenant.findUnique({
      where: {
        customDomain: this.domain
      }
    });

    if (!tenant) {
      throw new Error('Invalid tenant');
    }
    this.tenant = tenant;

    return tenant;
  }
}
