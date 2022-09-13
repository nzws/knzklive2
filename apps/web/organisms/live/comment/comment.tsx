import { Avatar, Flex, Skeleton, Text, VStack } from '@chakra-ui/react';
import { FC } from 'react';
import { CommentPublic } from '~/../server/src/models/comment';
import { useUser } from '~/utils/hooks/api/use-user';

type Props = {
  comment: CommentPublic;
};

export const Comment: FC<Props> = ({ comment }) => {
  const [user] = useUser(comment.userId);

  return (
    <VStack
      spacing={2}
      bg="#ffffff10"
      p={2}
      borderRadius={4}
      alignItems="left"
      flexShrink={0}
    >
      <Flex gap={2}>
        <Avatar name={user?.displayName} src={user?.avatarUrl} size="xs" />

        {user?.account ? (
          <Text noOfLines={1}>
            <Text as="b" mr={2}>
              {user?.displayName}
            </Text>

            <Text as="span" color="gray.400">
              {user?.account}
            </Text>
          </Text>
        ) : (
          <Skeleton height="23px" width="200px" ml={2} />
        )}
      </Flex>

      <Text>{comment.content}</Text>
    </VStack>
  );
};
