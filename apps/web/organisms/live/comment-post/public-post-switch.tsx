import {
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  Portal,
  Switch,
  Text,
  Tooltip,
  useDisclosure,
  VStack
} from '@chakra-ui/react';
import { FC, Fragment, useEffect, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

type Props = {
  acct?: string;
  hashtag?: string;
  isSignedIn: boolean;
  enablePublish: boolean;
  toggleEnablePublish: () => void;
};

export const PublicPostSwitch: FC<Props> = ({
  acct,
  hashtag,
  isSignedIn,
  enablePublish,
  toggleEnablePublish
}) => {
  const intl = useIntl();
  const isFirstOpenedRef = useRef(false);
  const { isOpen, onClose, onOpen } = useDisclosure();

  const statusIntlId = hashtag
    ? enablePublish
      ? 'live.comment-post.publish.tooltip.enabled'
      : 'live.comment-post.publish.tooltip.disabled'
    : 'live.comment-post.publish.tooltip.disabled-in-live';

  useEffect(() => {
    if (!isFirstOpenedRef.current && hashtag && enablePublish && isSignedIn) {
      const timeoutId = setTimeout(() => {
        isFirstOpenedRef.current = true;
        onOpen();
      }, 1000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [onOpen, hashtag, enablePublish, isSignedIn]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handler = () => {
      onClose();
    };

    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('click', handler);
    };
  }, [isOpen, onClose]);

  return (
    <Fragment>
      <Popover
        isOpen={isOpen}
        onClose={onClose}
        placement="bottom-end"
        closeOnBlur
        isLazy
        offset={[28, 24]}
        autoFocus={false}
      >
        <Tooltip
          label={intl.formatMessage({
            id: statusIntlId
          })}
          closeOnScroll
        >
          <VStack alignItems="center">
            <PopoverAnchor>
              <Switch
                size="sm"
                disabled={!isSignedIn || !hashtag}
                isChecked={hashtag ? enablePublish : false}
                onChange={toggleEnablePublish}
              />
            </PopoverAnchor>
          </VStack>
        </Tooltip>

        <Portal>
          <PopoverContent width="sm">
            <PopoverArrow />

            <PopoverHeader>
              <FormattedMessage id="live.comment-post.publish.popover.title" />
            </PopoverHeader>

            <PopoverCloseButton />

            <PopoverBody>
              <VStack gap={2}>
                <Text fontWeight="bold">
                  <FormattedMessage id={statusIntlId} />
                </Text>

                <Text>
                  <FormattedMessage
                    id="live.comment-post.publish.popover.description"
                    values={{ acct: acct || '', hashtag }}
                  />
                </Text>

                <Text fontSize="xs">
                  <FormattedMessage id="live.comment-post.publish.popover.description2" />
                </Text>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </Fragment>
  );
};
