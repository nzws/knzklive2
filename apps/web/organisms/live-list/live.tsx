import { FC, Fragment } from 'react';
import { LivePublic } from 'api-types/common/types';
import {
  AspectRatio,
  Badge,
  Box,
  Heading,
  Icon,
  LinkBox,
  LinkOverlay,
  Skeleton,
  Stack,
  Flex
} from '@chakra-ui/react';
import styled from '@emotion/styled';
import { RelativeTime } from '~/atoms/relative-time';
import { FormattedMessage } from 'react-intl';
import Link from 'next/link';
import { FiLock } from 'react-icons/fi';

type Props = {
  live?: LivePublic;
  currentWatchingCount?: number;
};

export const LiveItem: FC<Props> = ({ live, currentWatchingCount }) => (
  <Stack spacing={2}>
    <LinkBox>
      <VideoContainer
        ratio={16 / 9}
        position="relative"
        style={{
          backgroundImage: live
            ? `url(${
                live?.thumbnail?.publicUrl ||
                `/api/default-thumbnail.png?userId=${live.userId}`
              })`
            : undefined
        }}
        mb={2}
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

      {live ? (
        <Box color="gray.500" fontSize="sm">
          <RelativeTime date={live.startedAt} />
          {' · '}
          <FormattedMessage
            id="live-list.viewers"
            values={{
              count: currentWatchingCount || live.watchingSumCount || 0
            }}
          />

          {live.privacy === 'Private' && (
            <Fragment>
              {' · '}

              <Icon as={FiLock} mt={1} />
            </Fragment>
          )}
        </Box>
      ) : (
        <Skeleton height="18px" width="60%" />
      )}

      {live ? (
        <Box>
          <Heading fontSize="lg" fontWeight="bold" noOfLines={1}>
            <Link href={`/@${live.tenant.slug}/${live.idInTenant}`} passHref>
              <LinkOverlay>{live.title}</LinkOverlay>
            </Link>
          </Heading>
        </Box>
      ) : (
        <Skeleton height="24px" width="90%" />
      )}
    </LinkBox>

    <Flex>
      {live ? (
        <LinkBox>
          <Link href={`/@${live.tenant.slug}`} passHref>
            <LinkOverlay fontSize="sm" noOfLines={1} color="gray.300">
              {live?.tenant.displayName || live?.tenant.slug}
            </LinkOverlay>
          </Link>
        </LinkBox>
      ) : (
        <Skeleton height="23px" width="200px" ml={2} />
      )}
    </Flex>
  </Stack>
);

const VideoContainer = styled(AspectRatio)`
  background-color: #000;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
`;
