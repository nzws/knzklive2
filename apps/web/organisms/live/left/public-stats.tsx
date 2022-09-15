import { Box, Icon, Stack, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { FiLock } from 'react-icons/fi';
import { FormattedMessage } from 'react-intl';
import { FormattedDateTime } from '~/atoms/formatted-date-time';

type Props = {
  startedAt?: Date;
  endedAt?: Date;
  privacy: 'Public' | 'Private';
  currentViewers?: number;
  sumViewers?: number;
};

export const PublicStats: FC<Props> = ({
  startedAt,
  endedAt,
  currentViewers,
  sumViewers,
  privacy
}) => (
  <Stack
    spacing={4}
    direction={{ base: 'column', lg: 'row' }}
    color="gray.300"
    flexWrap="wrap"
  >
    <Box>
      {startedAt ? (
        <FormattedDateTime value={startedAt} />
      ) : (
        <FormattedMessage id="live.not-started" />
      )}
      {' - '}
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

    {privacy === 'Private' && (
      <Text>
        <Icon as={FiLock} mt={1} mr={1} />
        <FormattedMessage id="live.is-private" />
      </Text>
    )}
  </Stack>
);
