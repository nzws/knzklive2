import { Alert, Button, Stack } from '@chakra-ui/react';
import { FC, useCallback } from 'react';

type Props = {
  isWakeLockSupported: boolean;
  isWakeLockEnabled: boolean;
  enableWakeLock: () => Promise<void>;
  disableWakeLock: () => Promise<void>;
};

export const WakeLock: FC<Props> = ({
  isWakeLockEnabled,
  isWakeLockSupported,
  enableWakeLock,
  disableWakeLock
}) => {
  const toggleWakeLock = useCallback(
    () => (isWakeLockEnabled ? void disableWakeLock() : void enableWakeLock()),
    [isWakeLockEnabled, enableWakeLock, disableWakeLock]
  );

  return (
    <Stack spacing={4}>
      {!isWakeLockSupported && (
        <Alert status="warning">
          このデバイスはブラウザからの画面ロック制御に対応していません。
          <br />
          画面ロックされると数分後に接続が遮断されることがあります。
        </Alert>
      )}

      {isWakeLockSupported && !isWakeLockEnabled && (
        <Alert status="warning">
          現在画面ロック制御を無効化中です。
          <br />
          画面ロックされると数分後に接続が遮断されることがあります。
        </Alert>
      )}

      <Button
        onClick={toggleWakeLock}
        width="100%"
        isDisabled={!isWakeLockSupported}
      >
        {isWakeLockEnabled
          ? '画面ロック防止を無効化'
          : '画面ロック防止を有効化'}
      </Button>
    </Stack>
  );
};
