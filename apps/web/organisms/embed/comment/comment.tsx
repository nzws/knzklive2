import { Flex, keyframes, Skeleton, Text, VStack } from '@chakra-ui/react';
import { FC } from 'react';
import { CommentPublic } from 'api-types/common/types';
import { useUser } from '~/utils/hooks/api/use-user';
import { css } from '@emotion/react';

type Props = {
  comment: CommentPublic;
};

export const Comment: FC<Props> = ({ comment }) => {
  const [user] = useUser(comment.userId);

  return (
    <VStack spacing={2} p={2} alignItems="left" flexShrink={0} css={Container}>
      <Flex gap={2}>
        {user?.account ? (
          <Text>
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

const animation = keyframes`
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translateY(-50px);
  }
`;

const Container = css`
  animation: ${animation} 0.75s cubic-bezier(0.6, -0.2, 0.7, 0.05) reverse;
`;
