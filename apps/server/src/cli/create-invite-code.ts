import type { Command } from '@dotplants/cli';
import { invites } from '../models';

export const createInviteCode: Command = {
  description: 'Create invite code',
  function: async () => {
    const invite = await invites.createInviteByAdmin();
    console.log(`invite code created: ${invite.inviteId}`);
    process.exit(0);
  }
};
