import { Box, Icon, Stack, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { FiLock } from 'react-icons/fi';
import { FormattedMessage } from 'react-intl';
import { FormattedDateTime } from '~/atoms/formatted-date-time';

type Props = {
  startedAt?: Date;
  endedAt?: Date;
  viewingCount?: number;
  privacy: 'Public' | 'Private';
};

export const PublicStats: FC<Props> = ({
  startedAt,
  endedAt,
  viewingCount,
  privacy
}) => (
  <Stack
    spacing={4}
    direction={{ base: 'column', xl: 'row' }}
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
      <FormattedMessage
        id="live.current-viewer"
        values={{ count: viewingCount ?? '?' }}
      />
    </Text>

    {privacy === 'Private' && (
      <Text>
        <Icon as={FiLock} mt={1} mr={1} />
        <FormattedMessage id="live.is-private" />
      </Text>
    )}
  </Stack>
);
