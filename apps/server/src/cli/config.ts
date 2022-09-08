import type { ConfigTypes } from '@dotplants/cli';
import { addUser } from './add-user';

export const Config: ConfigTypes = {
  name: `KnzkLive CLI`,
  binName: 'yarn kanzaki',
  commands: {
    addUser
  }
};
