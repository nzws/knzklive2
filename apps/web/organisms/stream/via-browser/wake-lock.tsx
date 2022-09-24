import { Alert, Button, Stack } from '@chakra-ui/react';
import { FC, useCallback } from 'react';
import { useWakeLock } from '~/utils/hooks/use-wake-lock';

export const WakeLock: FC = () => {
  const {
    isWakeLockSupported,
    isWakeLockEnabled,
    enableWakeLock,
    disableWakeLock
  } = useWakeLock();

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
