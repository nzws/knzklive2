import { useCallback } from 'react';
import { MastodonStatusVisibility } from 'api-types/external-mastodon/api/v1/statuses';
import { MisskeyNoteVisibility } from 'api-types/external-misskey/api/notes/create';
import { client } from '~/utils/api/client';
import { getMastodonClient } from '~/utils/api/external-mastodon';
import { getMisskeyClient } from '~/utils/api/external-misskey';
import { MASTODON_DOMAIN_LS, MISSKEY_DOMAIN_LS } from '~/utils/contexts/auth';
import { useAuth } from '../use-auth';
import { HTTPError } from '@aspida/fetch';
import { useToast } from '@chakra-ui/react';
import { useIntl } from 'react-intl';

export const useCommentPublish = (liveId: number, hashtag?: string) => {
  const toast = useToast();
  const intl = useIntl();
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
              visibility: MastodonStatusVisibility.Unlisted
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

          try {
            await client.api.notes.create.post({
              body: {
                text: `${content} #${hashtag}`,
                visibility: MisskeyNoteVisibility.Home,
                i: misskeyToken
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
                toast({
                  title: intl.formatMessage({
                    id: 'toast.api-error.title'
                  }),
                  description: intl.formatMessage({
                    id: 'live.comment-post.permission-denied'
                  }),
                  status: 'error',
                  duration: 10000,
                  isClosable: true
                });

                throw new Error('');
              }
            }
            throw e;
          }
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
    [headers, liveId, hashtag, mastodonToken, misskeyToken, toast, intl]
  );

  return { handlePublish } as const;
};
