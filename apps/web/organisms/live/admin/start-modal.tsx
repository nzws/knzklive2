import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Stack,
  FormControl,
  Checkbox,
  FormLabel,
  Textarea,
  Collapse,
  useToast,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FC, useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  MisskeyRequestReSignError,
  postToExternal,
  Visibility
} from '~/utils/api/post-to-external';
import {
  MASTODON_DOMAIN_LS,
  MISSKEY_DOMAIN_LS,
  SignInType
} from '~/utils/contexts/auth';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { useUsersMe } from '~/utils/hooks/api/use-users-me';
import { useAuth } from '~/utils/hooks/use-auth';

type Props = {
  onPublish: () => Promise<void>;
  url: string;
  hashtag?: string;
  isOpen: boolean;
  onClose: () => void;
  isBroadcastViaBrowser: boolean;
};

export const StartModal: FC<Props> = ({
  onPublish,
  url,
  hashtag,
  isOpen,
  onClose,
  isBroadcastViaBrowser
}) => {
  const { mastodonToken, misskeyToken } = useAuth();
  const toast = useToast();
  const intl = useIntl();
  const [me] = useUsersMe();
  const [isLoading, setIsLoading] = useState(false);
  const [publishPost, setPublishPost] = useState(true);
  const [postText, setPostText] = useState('');
  const [postError, setPostError] = useState<unknown>();
  useAPIError(postError);

  const applyPreset = useCallback(
    (index: number) => {
      const preset = presets[index];
      if (!preset) {
        return;
      }

      setPostText(
        preset.text
          .replace(/\{url\}/g, url)
          .replace(/\{hashtag\}/g, hashtag ? `#${hashtag}` : '')
      );
    },
    [url, hashtag]
  );

  const post = useCallback(async () => {
    if (!publishPost || !postText) {
      return;
    }

    try {
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
          postText,
          Visibility.Public
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
            postText,
            Visibility.Public
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
    } catch (e) {
      setPostError(e);
      // 投稿が失敗しても throw しない
    }
  }, [publishPost, postText, mastodonToken, misskeyToken, toast, intl]);

  const handleClick = useCallback(() => {
    void (async () => {
      try {
        setIsLoading(true);
        await onPublish();
        await post();
        onClose();
      } catch {
        // noop
      } finally {
        setIsLoading(false);
      }
    })();
  }, [onPublish, onClose, post]);

  useEffect(() => {
    applyPreset(0);
  }, [applyPreset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      motionPreset="slideInBottom"
      scrollBehavior="inside"
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>配信を開始</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={6}>
            {isBroadcastViaBrowser && (
              <Alert status="info">
                <AlertIcon />
                配信を開始すると、マイクがオンになります。（ブラウザの許可ダイアログが表示された場合は、許可してください）
              </Alert>
            )}

            <FormControl>
              <Checkbox
                isChecked={publishPost}
                onChange={e => setPublishPost(e.target.checked)}
              >
                配信を開始したら {me?.account} で公開投稿する
              </Checkbox>
            </FormControl>

            <Collapse in={publishPost} animateOpacity>
              <Stack spacing={6}>
                <FormControl>
                  <FormLabel>投稿文</FormLabel>

                  <Textarea
                    value={postText}
                    onChange={e => setPostText(e.target.value)}
                    maxLength={500}
                    disabled={isLoading}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>プリセットを使用</FormLabel>

                  <Stack spacing={2}>
                    {presets.map((preset, index) => (
                      <Button
                        key={preset.name}
                        size="sm"
                        onClick={() => applyPreset(index)}
                        disabled={isLoading}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </Stack>
                </FormControl>
              </Stack>
            </Collapse>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            width="100%"
            onClick={handleClick}
            isLoading={isLoading}
          >
            配信を開始{publishPost && '＆投稿'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

type Preset = {
  name: string;
  text: string;
};

const presets: Preset[] = [
  {
    name: 'デフォルト',
    text: 'KnzkLive で配信中！ {url} {hashtag}'
  },
  {
    name: 'Knzk',
    text: '{url}\n{url}\n{url}'
  }
];
