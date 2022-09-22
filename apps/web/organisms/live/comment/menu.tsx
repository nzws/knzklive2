import { FC, useCallback, useMemo, useState } from 'react';
import {
  Menu,
  MenuButton,
  Button,
  Portal,
  MenuList,
  MenuGroup,
  MenuItem,
  useDisclosure,
  LinkOverlay,
  LinkBox
} from '@chakra-ui/react';
import { FormattedMessage, useIntl } from 'react-intl';
import { CommentPublic, UserPublic } from 'api-types/dist/common/types';
import { FiMoreHorizontal } from 'react-icons/fi';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useAuth } from '~/utils/hooks/use-auth';
import { client } from '~/utils/api/client';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { useRelativeTime } from '~/utils/hooks/use-relative-time';

type Props = {
  comment: CommentPublic;
  user?: UserPublic;
  isStreamer?: boolean;
};

export const CommentMenu: FC<Props> = ({ comment, user, isStreamer }) => {
  const { user: me, token } = useAuth();
  const intl = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  useAPIError(error);
  const isAbleToDelete = me?.id === user?.id || isStreamer;
  const relativeTime = useRelativeTime(comment.createdAt, isOpen);

  // todo: 仮
  const streamerUrl = useMemo(() => {
    if (!user?.account) {
      return;
    }
    const [id, domain] = user.account.split('@');

    return `https://${domain}/@${id}`;
  }, [user?.account]);

  const handleDelete = useCallback(async () => {
    try {
      setIsLoading(true);
      await client.v1.lives._liveId(comment.liveId).comments.$delete({
        query: {
          commentId: comment.id.toString()
        },
        headers: {
          Authorization: `Bearer ${token || ''}`
        }
      });
    } catch (error) {
      console.error(error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [comment, token]);

  return (
    <Menu onOpen={onOpen} onClose={onClose}>
      <MenuButton as={Button} variant="ghost" size="sm">
        <FiMoreHorizontal />
      </MenuButton>

      <Portal>
        <MenuList zIndex={99999}>
          <MenuGroup
            title={intl.formatMessage(
              {
                id: `live.comment.note.${
                  comment.sourceUrl ? 'remote' : 'local'
                }`
              },
              {
                relative: relativeTime
              }
            )}
          >
            {isAbleToDelete && (
              <MenuItem
                onClick={() => void handleDelete()}
                isDisabled={isLoading}
              >
                <FormattedMessage id="live.comment.delete" />
              </MenuItem>
            )}
          </MenuGroup>

          <MenuGroup title={user?.account}>
            <LinkBox as={MenuItem}>
              <LinkOverlay href={streamerUrl} isExternal>
                <FormattedMessage id="live.comment.account-page" />
                <ExternalLinkIcon mb={1} ml={2} />
              </LinkOverlay>
            </LinkBox>
          </MenuGroup>
        </MenuList>
      </Portal>
    </Menu>
  );
};
