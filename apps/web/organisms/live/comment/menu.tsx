import { FC, Fragment, useCallback, useState } from 'react';
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
import {
  CommentAutoModType,
  CommentPublic,
  UserPublic
} from 'api-types/common/types';
import { FiMoreHorizontal } from 'react-icons/fi';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useAuth } from '~/utils/hooks/use-auth';
import { client } from '~/utils/api/client';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { useRelativeTime } from '~/utils/hooks/use-relative-time';
import { ConfirmAutoModModal } from './confirm-auto-mod-modal';

type Props = {
  comment: CommentPublic;
  user?: UserPublic;
  isStreamer?: boolean;
  tenantId: number;
};

export const CommentMenu: FC<Props> = ({
  comment,
  user,
  isStreamer,
  tenantId
}) => {
  const { user: me, token, headers } = useAuth();
  const intl = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [confirmAutoMod, setConfirmAutoMod] = useState<
    Exclude<CommentAutoModType, 'Text'> | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  useAPIError(error);
  const isAbleToDelete = me?.id === user?.id || isStreamer;
  const relativeTime = useRelativeTime(comment.createdAt, isOpen);

  const domain = user?.account.split('@')[1];

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

  const handleSubmitAutoMod = useCallback(async () => {
    try {
      const value = confirmAutoMod === 'Domain' ? domain : user?.account;
      if (!confirmAutoMod || !headers || !value) {
        return;
      }

      setIsLoading(true);
      await client.v1.tenants._tenantId(tenantId).auto_mod.post({
        body: {
          type: confirmAutoMod,
          value
        },
        headers
      });

      setConfirmAutoMod(undefined);
    } catch (error) {
      console.error(error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [confirmAutoMod, domain, user?.account, headers, tenantId]);

  const commentTypeIntlId = comment.sourceUrl
    ? 'live.comment.note.remote'
    : 'live.comment.note.local';

  return (
    <Fragment>
      <ConfirmAutoModModal
        onClose={() => setConfirmAutoMod(undefined)}
        onSubmit={handleSubmitAutoMod}
        openType={confirmAutoMod}
        acct={user?.account}
      />

      <Menu onOpen={onOpen} onClose={onClose} isLazy>
        <MenuButton as={Button} variant="ghost" size="sm">
          <FiMoreHorizontal />
        </MenuButton>

        {isOpen && (
          <Portal>
            <MenuList zIndex={99999}>
              <MenuGroup
                title={intl.formatMessage(
                  {
                    id: commentTypeIntlId
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
                {isStreamer && (
                  <Fragment>
                    <MenuItem
                      onClick={() => setConfirmAutoMod('Account')}
                      isDisabled={isLoading}
                      color="red.400"
                    >
                      {user?.account} を非表示
                    </MenuItem>

                    <MenuItem
                      onClick={() => setConfirmAutoMod('Domain')}
                      isDisabled={isLoading}
                      color="red.400"
                    >
                      *.{domain} を非表示
                    </MenuItem>
                  </Fragment>
                )}

                <LinkBox as={MenuItem}>
                  <LinkOverlay href={user?.url} isExternal>
                    <FormattedMessage id="live.comment.account-page" />
                    <ExternalLinkIcon mb={1} ml={2} />
                  </LinkOverlay>
                </LinkBox>
              </MenuGroup>
            </MenuList>
          </Portal>
        )}
      </Menu>
    </Fragment>
  );
};
