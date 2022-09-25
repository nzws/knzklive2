import { Box, Button, Flex, Heading, VStack } from '@chakra-ui/react';
import { FC } from 'react';
import { FormattedMessage } from 'react-intl';
import { CommentPublic } from 'api-types/common/types';
import { Comment } from './comment';

type Props = {
  hashtag?: string;
  comments: CommentPublic[];
  isStreamer?: boolean;
  isConnectingStreaming: boolean;
  reconnectStreaming: () => void;
};

export const Comments: FC<Props> = ({
  hashtag,
  comments,
  isConnectingStreaming,
  reconnectStreaming,
  isStreamer
}) => (
  <Flex flexDirection="column" height={{ base: '700px', lg: '100%' }}>
    <Box p={4}>
      <Heading size="sm">
        <FormattedMessage
          id={
            hashtag ? 'live.comment.title.with-hashtag' : 'live.comment.title'
          }
          values={{ hashtag }}
        />
      </Heading>
    </Box>

    <Box overflowY="auto">
      <VStack spacing={2} p={2} align="stretch">
        {!isConnectingStreaming && (
          <Button
            colorScheme="blue"
            variant="outline"
            width="100%"
            onClick={reconnectStreaming}
          >
            <FormattedMessage id="live.comment.reconnect" />
          </Button>
        )}

        {comments.map(comment => (
          <Comment key={comment.id} comment={comment} isStreamer={isStreamer} />
        ))}
      </VStack>
    </Box>
  </Flex>
);
