import type { Command } from '@dotplants/cli';
import { tenants, users } from '@server/models';

export const addUser: Command = {
  description: 'add user',
  function: async ({ flags }) => {
    const { createTenant, account } = flags;
    if (!account || typeof account !== 'string') {
      throw new Error('account (e.g. nzws@don.nzws.me) is required');
    }

    const user = await users.create(account);
    console.log(`user ${user.account} (id=${user.id}) created`);

    if (!createTenant) {
      return;
    }

    const slug = user.account.split('@')[0];
    if (!slug) {
      throw new Error('Invalid account');
    }

    const tenant = await tenants.create(slug, user);
    console.log(`tenant ${tenant.slug} (id=${tenant.id}) created`);
  },
  flags: {
    createTenant: {
      name: ['create-tenant', 'c'],
      description: 'create tenant',
      hasValue: 0
    },
    account: {
      name: ['account', 'a'],
      description: 'account (e.g. nzws@don.nzws.me)',
      hasValue: 2
    }
  }
};
