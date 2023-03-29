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
import { FC, Fragment, useCallback, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

type Props = {
  acct?: string;
  hashtag?: string;
  isSignedIn: boolean;
  enablePublish?: boolean;
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

  const handleSwitch = useCallback(() => {
    toggleEnablePublish();

    if (!isFirstOpenedRef.current) {
      isFirstOpenedRef.current = true;
      onOpen();
    }
  }, [toggleEnablePublish, onOpen]);

  return (
    <Fragment>
      <Popover
        isOpen={isOpen}
        onClose={onClose}
        placement="bottom-end"
        closeOnBlur
        isLazy
        offset={[28, 24]}
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
                isChecked={hashtag ? enablePublish ?? false : false}
                onChange={handleSwitch}
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
              <VStack gap="4px">
                <Text fontWeight="bold">
                  <FormattedMessage id={statusIntlId} />
                </Text>

                <Text>
                  <FormattedMessage
                    id="live.comment-post.publish.popover.description"
                    values={{ acct: acct || '', hashtag }}
                  />
                </Text>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </Fragment>
  );
};
