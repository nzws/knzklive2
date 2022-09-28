import {
  Avatar,
  Flex,
  Heading,
  HStack,
  LinkBox,
  LinkOverlay,
  Skeleton,
  Text,
  VStack
} from '@chakra-ui/react';
import { FC } from 'react';

type Props = {
  displayName?: string;
  avatarUrl?: string;
  account?: string;
  url?: string;
};

export const Streamer: FC<Props> = ({
  displayName,
  avatarUrl,
  account,
  url
}) => (
  <Flex>
    <LinkBox>
      <HStack spacing={4}>
        <Avatar name={displayName} src={avatarUrl} />

        <VStack spacing={1} alignItems="left">
          {account ? (
            <Heading size="md">
              <LinkOverlay href={url} isExternal>
                {displayName || account.split('@')[0]}
              </LinkOverlay>
            </Heading>
          ) : (
            <Skeleton height="26px" width="200px" />
          )}

          {account ? (
            <Text color="gray.400">{account}</Text>
          ) : (
            <Skeleton height="24px" width="150px" />
          )}
        </VStack>
      </HStack>
    </LinkBox>
  </Flex>
);
