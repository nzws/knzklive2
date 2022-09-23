import { Alert, AlertIcon } from '@chakra-ui/react';
import { FC } from 'react';

export const NotStarted: FC = () => (
  <Alert status="warning">
    <AlertIcon />
    配信が開始されていないため、現在は自分のみ視聴できます。準備が完了したら「配信を開始」をタップしてください。
  </Alert>
);
