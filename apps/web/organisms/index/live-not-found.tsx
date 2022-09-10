import { Image, Stack, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { FormattedMessage } from 'react-intl';

export const LiveNotFound: FC = () => (
  <Stack spacing={10} py={24} align="center" textAlign="center">
    <Image
      src="/static/surprized_knzk.png"
      alt="Surprized knzk"
      width="300px"
      filter="brightness(0.8)"
    />

    <Text fontSize="xl" color="gray.300">
      <FormattedMessage id="page.index.live-not-found" />
    </Text>
  </Stack>
);
