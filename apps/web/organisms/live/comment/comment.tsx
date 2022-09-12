import { Avatar, Flex, Skeleton, Text, VStack } from '@chakra-ui/react';
import { FC } from 'react';
import { CommentPublic } from '~/../server/src/models/comment';
import { useUser } from '~/utils/hooks/api/use-user';

type Props = {
  comment: CommentPublic;
};

export const Comment: FC<Props> = ({ comment }) => {
  const [user] = useUser(comment.userId);

  // todo: 280px 直す

  return (
    <VStack
      spacing={2}
      bg="rbga(255, 255, 255, 0.1)"
      borderRadius={4}
      width="100%"
      alignItems="left"
      flexShrink={0}
    >
      <Flex gap={2} width="100%">
        <Avatar name={user?.displayName} src={user?.avatarUrl} size="xs" />

        {user?.account ? (
          <Text noOfLines={1} flexShrink={0} width="280px">
            <Text as="b" mr={2}>
              {user?.displayName}
            </Text>

            <Text as="span" color="gray.400">
              {user?.account}
            </Text>
          </Text>
        ) : (
          <Skeleton height="24px" width="120px" />
        )}
      </Flex>

      <Text>{comment.content}</Text>
    </VStack>
  );
};
