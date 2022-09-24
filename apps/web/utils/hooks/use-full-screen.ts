import { useCallback, useEffect, useState } from 'react';

export const useFullScreen = () => {
  const [isEnabledFullScreen, setIsEnabledFullScreen] = useState(false);

  const handleEnterFullScreen = useCallback(() => {
    try {
      void document.body.requestFullscreen();
    } catch (e) {
      console.error(e);
    }
    setIsEnabledFullScreen(true);
  }, []);

  const handleExitFullScreen = useCallback(() => {
    try {
      if (document.fullscreenElement) {
        void document.exitFullscreen();
      }
    } catch (e) {
      console.error(e);
    }

    setIsEnabledFullScreen(false);
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsEnabledFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  return {
    isEnabledFullScreen,
    handleEnterFullScreen,
    handleExitFullScreen
  } as const;
};
