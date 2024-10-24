import {
  Button,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverAnchor,
  useDisclosure
} from '@chakra-ui/react';
import { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { FiSend } from 'react-icons/fi';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { useAuth } from '~/utils/hooks/use-auth';
import { useUsersMe } from '~/utils/hooks/api/use-users-me';
import { useLocalStorage } from 'react-use';
import { useCommentPublish } from '~/utils/hooks/api/use-comment-publish';
import { PublicPostSwitch } from './public-post-switch';
import { FediverseSyncPopover } from './fediverse-sync-popover';

type Props = {
  liveId: number;
  hashtag?: string;
};

export const CommentPost: FC<Props> = ({ liveId, hashtag }) => {
  const { token, isSignedIn } = useAuth();
  const [me] = useUsersMe();
  const intl = useIntl();
  const [enablePublish, setEnablePublish] = useLocalStorage<boolean>(
    'knzklive-enable-publish',
    true
  );
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {
    isOpen: fediSyncPopoverIsOpen,
    onOpen: fediSyncPopoverOnOpen,
    onClose: fediSyncPopoverOnClose
  } = useDisclosure();
  const { handlePublish } = useCommentPublish(liveId, hashtag);
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const toggleEnablePublish = useCallback(() => {
    setEnablePublish(!enablePublish);
  }, [setEnablePublish, enablePublish]);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!comment || !token) {
        return;
      }
      setIsLoading(true);

      void (async () => {
        try {
          await handlePublish(
            hashtag ? enablePublish ?? false : false,
            comment
          );

          setComment('');
        } catch (e) {
          console.warn(e);
          setError(e);
        } finally {
          setIsLoading(false);
        }
      })();
    },
    [comment, token, enablePublish, handlePublish, hashtag]
  );

  useEffect(() => {
    if (!isSignedIn && hashtag) {
      const timeoutId = setTimeout(() => {
        fediSyncPopoverOnOpen();
      }, 1000 * 3);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isSignedIn, fediSyncPopoverOnOpen, hashtag]);

  useEffect(() => {
    if (!fediSyncPopoverIsOpen) {
      return;
    }

    const handler = () => {
      fediSyncPopoverOnClose();
    };

    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('click', handler);
    };
  }, [fediSyncPopoverOnClose, fediSyncPopoverIsOpen]);

  return (
    <form onSubmit={handleSubmit}>
      <Popover
        isOpen={fediSyncPopoverIsOpen}
        onClose={fediSyncPopoverOnClose}
        placement="bottom"
        closeOnBlur
        isLazy
        autoFocus={false}
      >
        <PopoverAnchor>
          <InputGroup>
            <Input
              pr="3.5rem"
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={intl.formatMessage(
                {
                  id: !isSignedIn
                    ? hashtag
                      ? 'live.comment-post.require-login.with-hashtag'
                      : 'live.comment-post.require-login'
                    : hashtag
                      ? 'live.comment-post.placeholder.with-hashtag'
                      : 'live.comment-post.placeholder'
                },
                { hashtag }
              )}
              isDisabled={!isSignedIn}
              maxLength={100}
              borderTopRadius={0}
              borderBottomRadius={{
                base: 8,
                md: 15
              }}
            />

            <InputRightElement width="6rem">
              <HStack gap={2}>
                <PublicPostSwitch
                  acct={me?.account}
                  hashtag={hashtag}
                  isSignedIn={isSignedIn}
                  enablePublish={enablePublish ?? false}
                  toggleEnablePublish={toggleEnablePublish}
                />

                <Button
                  h="1.75rem"
                  size="sm"
                  type="submit"
                  colorScheme="blue"
                  isLoading={isLoading}
                  isDisabled={!isSignedIn}
                >
                  <Icon as={FiSend} />
                </Button>
              </HStack>
            </InputRightElement>
          </InputGroup>
        </PopoverAnchor>

        {!isSignedIn && !!hashtag && <FediverseSyncPopover hashtag={hashtag} />}
      </Popover>
    </form>
  );
};
