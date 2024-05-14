import type { ConfigTypes } from '@dotplants/cli';
import { addUser } from './add-user';
import { generateKey } from './generate-key';
import { createInviteCode } from './create-invite-code';

export const Config: ConfigTypes = {
  name: `KnzkLive CLI`,
  binName: 'yarn kanzaki',
  commands: {
    addUser,
    generateKey,
    createInviteCode
  }
};
