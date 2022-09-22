import { Box, Button, Flex, Heading, VStack } from '@chakra-ui/react';
import { FC } from 'react';
import { FormattedMessage } from 'react-intl';
import { LivePublic } from 'api-types/common/types';
import { Comment } from './comment';
import { useComments } from '~/utils/hooks/api/use-comments';

type Props = {
  live: LivePublic;
  isStreamer?: boolean;
};

export const Comments: FC<Props> = ({ live, isStreamer }) => {
  const { comments, hasApiError, reconnect } = useComments(
    !live.endedAt,
    live.id
  );

  return (
    <Flex flexDirection="column" height={{ base: '700px', lg: '100%' }}>
      <Box p={4}>
        <Heading size="sm">
          <FormattedMessage
            id={
              live.hashtag
                ? 'live.comment.title.with-hashtag'
                : 'live.comment.title'
            }
            values={{ hashtag: live.hashtag }}
          />
        </Heading>
      </Box>

      <Box overflowY="auto">
        <VStack spacing={2} p={2} align="stretch">
          {hasApiError && (
            <Button
              colorScheme="blue"
              variant="outline"
              width="100%"
              onClick={reconnect}
            >
              <FormattedMessage id="live.comment.reconnect" />
            </Button>
          )}

          {comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              isStreamer={isStreamer}
            />
          ))}
        </VStack>
      </Box>
    </Flex>
  );
};
