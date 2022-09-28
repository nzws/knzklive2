import { FC } from 'react';
import { LivePublic } from 'api-types/common/types';
import {
  AspectRatio,
  Avatar,
  Badge,
  Box,
  Flex,
  Heading,
  LinkBox,
  LinkOverlay,
  Skeleton,
  Stack,
  Text
} from '@chakra-ui/react';
import styled from '@emotion/styled';
import { useUser } from '~/utils/hooks/api/use-user';
import { RelativeTime } from '~/atoms/relative-time';
import { FormattedMessage } from 'react-intl';
import Link from 'next/link';
import { useTenant } from '~/utils/hooks/api/use-tenant';

type Props = {
  live?: LivePublic;
  currentWatchingCount?: number;
};

export const LiveItem: FC<Props> = ({ live, currentWatchingCount }) => {
  const [user] = useUser(live?.userId);
  const [tenant] = useTenant(live?.tenantId);

  return (
    <LinkBox as={Stack} spacing={3}>
      <VideoContainer
        ratio={16 / 9}
        position="relative"
        style={{
          backgroundImage:
            live && user
              ? `url(${
                  live?.thumbnail?.publicUrl ||
                  `/api/default-thumbnail.png?userId=${user?.id}`
                })`
              : undefined
        }}
      >
        {live ? (
          <Box>
            {!live.endedAt && (
              <Badge
                colorScheme="pink"
                position="absolute"
                left={2}
                top={2}
                fontSize="sm"
                variant="solid"
                borderRadius={16}
                px={2}
              >
                <FormattedMessage id="live-list.current-live" />
              </Badge>
            )}
          </Box>
        ) : (
          <Skeleton />
        )}
      </VideoContainer>

      <Stack spacing={2}>
        {live ? (
          <Text color="gray.500" fontSize="sm">
            <RelativeTime date={live.startedAt} />
            {' · '}
            {currentWatchingCount !== undefined && (
              <FormattedMessage
                id="live-list.current-viewers"
                values={{ current: currentWatchingCount }}
              />
            )}
          </Text>
        ) : (
          <Skeleton height="18px" width="60%" />
        )}

        {live && tenant ? (
          <Heading fontSize="lg" fontWeight="bold" noOfLines={1}>
            <Link href={`/@${tenant?.slug}/${live.idInTenant}`} passHref>
              <LinkOverlay>{live.title}</LinkOverlay>
            </Link>
          </Heading>
        ) : (
          <Skeleton height="24px" width="90%" />
        )}

        <Flex gap={2} alignItems="center">
          <Avatar name={user?.displayName} src={user?.avatarUrl} size="xs" />

          {user?.account ? (
            <Text fontSize="sm" noOfLines={1} color="gray.300">
              {user?.displayName || user?.account}
            </Text>
          ) : (
            <Skeleton height="23px" width="200px" ml={2} />
          )}
        </Flex>
      </Stack>
    </LinkBox>
  );
};

const VideoContainer = styled(AspectRatio)`
  background-color: #000;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
`;
