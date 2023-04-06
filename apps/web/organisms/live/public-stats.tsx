import { Box, Icon, Stack, Text } from '@chakra-ui/react';
import { FC, Fragment } from 'react';
import { FiLock } from 'react-icons/fi';
import { FormattedMessage, useIntl } from 'react-intl';
import { LivePrivacy } from 'api-types/common/types';
import { FormattedDateTime } from '~/atoms/formatted-date-time';
import { RelativeTime } from '~/atoms/relative-time';

type Props = {
  startedAt?: Date;
  endedAt?: Date;
  privacy: LivePrivacy;
  isRequiredFollowing: boolean;
  isRequiredFollower: boolean;
  currentViewers?: number;
  sumViewers?: number;
  videoWatchers?: number;
};

export const PublicStats: FC<Props> = ({
  startedAt,
  endedAt,
  currentViewers,
  sumViewers,
  privacy,
  isRequiredFollowing,
  isRequiredFollower,
  videoWatchers
}) => {
  const intl = useIntl();

  return (
    <Stack
      spacing={4}
      direction={{ base: 'column', lg: 'row' }}
      color="gray.300"
      flexWrap="wrap"
    >
      <Box>
        {startedAt ? (
          <Fragment>
            <FormattedDateTime value={startedAt} />
            <Text as="span" ml="1">
              (<RelativeTime date={startedAt} />)
            </Text>
          </Fragment>
        ) : (
          <FormattedMessage id="live.not-started" />
        )}

        <Text as="span" mx="2">
          -
        </Text>

        {endedAt && <FormattedDateTime value={endedAt} />}
      </Box>

      <Text>
        {currentViewers === undefined ? (
          <FormattedMessage
            id="live.viewers-count"
            values={{ sum: sumViewers ?? '?' }}
          />
        ) : (
          <FormattedMessage
            id="live.viewers-count.with-current"
            values={{ current: currentViewers, sum: sumViewers ?? '?' }}
          />
        )}
      </Text>

      {videoWatchers !== undefined && (
        <Text>
          <FormattedMessage
            id="video.watchers-count"
            values={{ count: videoWatchers }}
          />
        </Text>
      )}

      {privacy === 'Private' && (
        <Text>
          <Icon as={FiLock} mt={1} mr={1} />
          {isRequiredFollowing || isRequiredFollower ? (
            <FormattedMessage
              id="live.is-private.with-attr"
              values={{
                attr: [
                  isRequiredFollowing &&
                    intl.formatMessage({
                      id: 'live.is-private.require-following'
                    }),
                  isRequiredFollower &&
                    intl.formatMessage({
                      id: 'live.is-private.require-follower'
                    })
                ]
                  .filter(Boolean)
                  .join(', ')
              }}
            />
          ) : (
            <FormattedMessage id="live.is-private" />
          )}
        </Text>
      )}

      {privacy === 'Hidden' && (
        <Text>
          <Icon as={FiLock} mt={1} mr={1} />
          <FormattedMessage id="live.is-hidden" />
        </Text>
      )}
    </Stack>
  );
};
