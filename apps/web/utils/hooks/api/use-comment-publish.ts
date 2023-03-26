import { useCallback } from 'react';
import { MastodonStatusVisibility } from 'api-types/external-mastodon/api/v1/statuses';
import { MisskeyNoteVisibility } from 'api-types/external-misskey/api/notes/create';
import { client } from '~/utils/api/client';
import { getMastodonClient } from '~/utils/api/external-mastodon';
import { getMisskeyClient } from '~/utils/api/external-misskey';
import { MASTODON_DOMAIN_LS, MISSKEY_DOMAIN_LS } from '~/utils/contexts/auth';
import { useAuth } from '../use-auth';

export const useCommentPublish = (liveId: number, hashtag?: string) => {
  const { headers, mastodonToken, misskeyToken } = useAuth();

  const handlePublish = useCallback(
    async (external: boolean, content: string) => {
      if (external) {
        if (!hashtag) {
          throw new Error('hashtag is required');
        }

        if (mastodonToken) {
          const domain = localStorage.getItem(MASTODON_DOMAIN_LS);
          if (!domain) {
            throw new Error('domain is required');
          }
          const client = getMastodonClient(domain);

          await client.api.v1.statuses.post({
            body: {
              status: `${content} #${hashtag}`,
              visibility: MastodonStatusVisibility.Public
            },
            headers: {
              Authorization: `Bearer ${mastodonToken}`
            }
          });
        } else if (misskeyToken) {
          const domain = localStorage.getItem(MISSKEY_DOMAIN_LS);
          if (!domain) {
            throw new Error('domain is required');
          }
          const client = getMisskeyClient(domain);

          await client.api.notes.create.post({
            body: {
              text: `${content} #${hashtag}`,
              visibility: MisskeyNoteVisibility.Public,
              i: misskeyToken
            }
          });
        }
      } else {
        if (!headers) {
          throw new Error('Not logged in');
        }

        await client.v1.lives._liveId(liveId).comments.post({
          body: {
            content
          },
          headers
        });
      }
    },
    [headers, liveId, hashtag, mastodonToken, misskeyToken]
  );

  return { handlePublish } as const;
};
