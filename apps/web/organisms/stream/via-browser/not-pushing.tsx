import { Alert, AlertIcon } from '@chakra-ui/react';
import { FC } from 'react';

export const NotPushing: FC = () => (
  <Alert status="warning">
    <AlertIcon />
    現在、映像がプッシュされていません。下記の「サーバーに接続」をタップしてください。
    <br />
    配信中にこの表示が再度出てきた場合はエンコーダーが予期しないタイミングで停止した可能性があるため、一度再接続してください。
  </Alert>
);
