import { Box, Stack, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { FormattedMessage } from 'react-intl';
import { FormattedDateTime } from '~/atoms/formatted-date-time';

type Props = {
  startedAt?: Date;
  endedAt?: Date;
  viewingCount?: number;
};

export const PublicStats: FC<Props> = ({
  startedAt,
  endedAt,
  viewingCount
}) => (
  <Stack spacing={4} direction={{ base: 'column', xl: 'row' }}>
    <Box color="gray.300">
      {startedAt ? (
        <FormattedDateTime value={startedAt} />
      ) : (
        <FormattedMessage id="live.not-started" />
      )}
      {' - '}
      {endedAt && <FormattedDateTime value={endedAt} />}
    </Box>

    <Text color="gray.300">
      <FormattedMessage
        id="live.current-viewer"
        values={{ count: viewingCount ?? '?' }}
      />
    </Text>
  </Stack>
);
