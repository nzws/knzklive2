import { HTTPError } from '@aspida/fetch';
import { MastodonStatusVisibility } from 'api-types/external-mastodon/api/v1/statuses';
import { MisskeyNoteVisibility } from 'api-types/external-misskey/api/notes/create';
import { SignInType } from '../contexts/auth';
import { getMastodonClient } from './external-mastodon';
import { getMisskeyClient } from './external-misskey';

interface Account {
  type: SignInType;
  domain: string;
  token: string;
}

export enum Visibility {
  Public,
  Home
}

export const postToExternal = async (
  account: Account,
  text: string,
  visibility: Visibility
) => {
  const { type, domain, token } = account;

  if (type === SignInType.Mastodon) {
    const client = getMastodonClient(domain);

    await client.api.v1.statuses.post({
      body: {
        status: text,
        visibility:
          visibility === Visibility.Public
            ? MastodonStatusVisibility.Public
            : MastodonStatusVisibility.Unlisted
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } else if (type === SignInType.Misskey) {
    const client = getMisskeyClient(domain);

    try {
      await client.api.notes.create.post({
        body: {
          text,
          visibility:
            visibility === Visibility.Public
              ? MisskeyNoteVisibility.Public
              : MisskeyNoteVisibility.Home,
          i: token
        }
      });
    } catch (e) {
      if (e instanceof HTTPError) {
        const body = (await e.response.json()) as {
          error?: {
            message?: string;
            code?: string;
            id?: string;
          };
        };

        if (body.error?.code === 'PERMISSION_DENIED') {
          throw new MisskeyRequestReSignError();
        }
      }
      throw e;
    }
  }
};

export class MisskeyRequestReSignError extends Error {
  constructor() {
    super('MisskeyRequestReSignError');
  }
}
