import { Alert, AlertIcon } from '@chakra-ui/react';
import { FC } from 'react';

export const NotPushing: FC = () => (
  <Alert status="warning">
    <AlertIcon />
    現在、映像がプッシュされていません。下記の「サーバーに接続」をタップしてください。
  </Alert>
);
