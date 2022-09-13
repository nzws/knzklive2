import { Alert, AlertIcon, AspectRatio } from '@chakra-ui/react';
import { FC } from 'react';
import { FormattedMessage } from 'react-intl';

export const NotPushed: FC = () => (
  <AspectRatio ratio={16 / 9}>
    <Alert status="info">
      <AlertIcon />
      <FormattedMessage id="live.not-pushed" />
    </Alert>
  </AspectRatio>
);
