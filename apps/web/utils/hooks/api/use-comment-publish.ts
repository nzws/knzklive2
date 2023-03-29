import { useCallback } from 'react';
import { client } from '~/utils/api/client';
import {
  MASTODON_DOMAIN_LS,
  MISSKEY_DOMAIN_LS,
  SignInType
} from '~/utils/contexts/auth';
import { useAuth } from '../use-auth';
import { useToast } from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import {
  MisskeyRequestReSignError,
  postToExternal,
  Visibility
} from '~/utils/api/post-to-external';

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

        const text = `${content} #${hashtag}`;

        if (mastodonToken) {
          const domain = localStorage.getItem(MASTODON_DOMAIN_LS);
          if (!domain) {
            throw new Error('domain is required');
          }

          await postToExternal(
            {
              type: SignInType.Mastodon,
              domain,
              token: mastodonToken
            },
            text,
            Visibility.Home
          );
        } else if (misskeyToken) {
          const domain = localStorage.getItem(MISSKEY_DOMAIN_LS);
          if (!domain) {
            throw new Error('domain is required');
          }

          try {
            await postToExternal(
              {
                type: SignInType.Misskey,
                domain,
                token: misskeyToken
              },
              text,
              Visibility.Home
            );
          } catch (e) {
            if (e instanceof MisskeyRequestReSignError) {
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
            }
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
