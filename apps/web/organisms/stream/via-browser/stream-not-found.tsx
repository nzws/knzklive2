import { Alert, AlertIcon } from '@chakra-ui/react';
import { FC } from 'react';

export const StreamNotFound: FC = () => (
  <Alert status="warning">
    <AlertIcon />
    開始できる配信枠が無いようです。先に配信枠を作成してください。
  </Alert>
);
