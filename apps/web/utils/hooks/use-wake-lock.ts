import { useCallback, useEffect, useRef, useState } from 'react';
import { useAPIError } from './api/use-api-error';

export const useWakeLock = () => {
  const [isWakeLockSupported, setIsWakeLockSupported] = useState(false);
  const [isWakeLockEnabled, setIsWakeLockEnabled] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel>();
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const disableWakeLock = useCallback(async () => {
    try {
      if (wakeLockRef) {
        await wakeLockRef.current?.release();
        wakeLockRef.current = undefined;
      }
      setIsWakeLockEnabled(false);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const enableWakeLock = useCallback(async () => {
    try {
      await disableWakeLock();
      const wakeLock = await navigator.wakeLock.request('screen');

      wakeLock.addEventListener('release', () => {
        setIsWakeLockEnabled(false);
      });
      wakeLockRef.current = wakeLock;

      setIsWakeLockEnabled(true);
    } catch (e) {
      console.warn(e);
      setError(e);
    }
  }, [disableWakeLock]);

  useEffect(() => {
    if (!('wakeLock' in navigator)) {
      setIsWakeLockSupported(false);
      return;
    }
    setIsWakeLockSupported(true);

    void enableWakeLock();

    const handleVisibilityChange = () => {
      if (wakeLockRef.current && document.visibilityState === 'visible') {
        void enableWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      void disableWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enableWakeLock, disableWakeLock]);

  return {
    isWakeLockSupported,
    isWakeLockEnabled,
    enableWakeLock,
    disableWakeLock
  } as const;
};
