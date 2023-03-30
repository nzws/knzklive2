import { Avatar, Flex, Skeleton, Spacer, Text, VStack } from '@chakra-ui/react';
import { FC } from 'react';
import { CommentPublic } from 'api-types/common/types';
import { useUser } from '~/utils/hooks/api/use-user';
import { CommentMenu } from './menu';
import { useAuth } from '~/utils/hooks/use-auth';

type Props = {
  tenantId: number;
  comment: CommentPublic;
  isStreamer?: boolean;
};

export const Comment: FC<Props> = ({ tenantId, comment, isStreamer }) => {
  const { user: me } = useAuth();
  const [user] = useUser(comment.userId);

  if (comment.isHidden && me?.id !== comment.userId && !isStreamer) {
    return null;
  }

  return (
    <VStack
      spacing={1}
      bg="#ffffff10"
      p={2}
      borderRadius={4}
      alignItems="left"
      flexShrink={0}
    >
      {isStreamer && comment.isHidden && (
        <Text color="red.500" fontSize="sm" fontStyle="italic">
          モデレーションにより非表示
        </Text>
      )}

      <Flex gap={2} alignItems="center">
        <Avatar name={user?.displayName} src={user?.avatarUrl} size="xs" />

        {user?.account ? (
          <Text as="b" noOfLines={1}>
            {user?.displayName || user?.account}
          </Text>
        ) : (
          <Skeleton height="23px" width="200px" ml={2} />
        )}

        <Spacer />

        <CommentMenu
          comment={comment}
          user={user}
          isStreamer={isStreamer}
          tenantId={tenantId}
        />
      </Flex>

      <Text>{comment.content}</Text>
    </VStack>
  );
};
