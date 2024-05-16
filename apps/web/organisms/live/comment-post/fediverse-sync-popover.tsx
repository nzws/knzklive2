import {
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  Portal,
  Text,
  VStack
} from '@chakra-ui/react';
import { FC } from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  hashtag: string;
};

export const FediverseSyncPopover: FC<Props> = ({ hashtag }) => {
  return (
    <Portal>
      <PopoverContent width="700px" maxWidth="100dvw">
        <PopoverArrow />

        <PopoverHeader textAlign="center" fontWeight="bold">
          <FormattedMessage
            id="live.comment-post.fediverse-sync.title"
            values={{ hashtag }}
          />
        </PopoverHeader>

        <PopoverCloseButton />

        <PopoverBody>
          <VStack gap={2}>
            <Text textAlign="center" fontSize="sm">
              <FormattedMessage
                id="live.comment-post.fediverse-sync.description"
                values={{ hashtag }}
              />
            </Text>

            <Text fontSize="xs" w="full">
              <FormattedMessage
                id="live.comment-post.fediverse-sync.notice"
                values={{ hashtag }}
              />
            </Text>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Portal>
  );
};
