import type Mpegts from 'mpegts.js';
import type Hls from 'hls.js';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { PlayUrl } from 'api-types/api/v1/lives/_liveId@number/url';
import { useAPIError } from './api/use-api-error';

export enum PlayType {
  Flv = 'flv',
  Hls = 'hls',
  Aac = 'aac'
}

export const useVideoStream = (
  videoTagRef: RefObject<HTMLVideoElement>,
  url: PlayUrl | undefined,
  onMaybeBlocked: () => void
) => {
  const mpegtsPlayerRef = useRef<Mpegts.Player>();
  const hlsPlayerRef = useRef<Hls>();
  const [playType, setPlayType] = useState<PlayType>(PlayType.Flv);
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const play = useCallback(async () => {
    try {
      if (mpegtsPlayerRef.current) {
        await mpegtsPlayerRef.current.play();
      } else {
        await videoTagRef.current?.play();
      }
    } catch (e) {
      console.warn(e);
      onMaybeBlocked();
    }
  }, [videoTagRef, onMaybeBlocked]);

  const handleFlv = useCallback(async () => {
    if (!videoTagRef.current || !url?.flv) {
      return;
    }

    try {
      const Mpegts = (await import('mpegts.js')).default;

      if (!Mpegts.getFeatureList().mseLivePlayback) {
        setPlayType(PlayType.Hls);
        return;
      }

      const player = Mpegts.createPlayer(
        {
          type: 'flv',
          isLive: true,
          url: url.flv
        },
        {
          enableStashBuffer: false,
          stashInitialSize: 1024 * 64,
          enableWorker: true,
          autoCleanupSourceBuffer: true,
          liveBufferLatencyChasing: true
        }
      );
      mpegtsPlayerRef.current = player;

      player.attachMediaElement(videoTagRef.current);
      player.load();

      try {
        await player.play();
      } catch (e) {
        console.warn(e);
        onMaybeBlocked();
      }
    } catch (e) {
      setError(e);
    }
  }, [url, videoTagRef, onMaybeBlocked]);

  const handleHls = useCallback(async () => {
    if (!videoTagRef.current || !url?.hls) {
      return;
    }

    let player;
    try {
      const Hls = (await import('hls.js')).default;

      if (Hls.isSupported()) {
        player = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsPlayerRef.current = player;

        player.loadSource(url.hls);
        player.attachMedia(videoTagRef.current);
      } else if (
        videoTagRef.current.canPlayType('application/vnd.apple.mpegurl')
      ) {
        videoTagRef.current.src = url.hls;
        return;
      } else {
        throw new Error('HLS is not supported');
      }
    } catch (e) {
      setError(e);
    }

    try {
      await videoTagRef.current.play();
    } catch (e) {
      console.warn(e);
      onMaybeBlocked();
    }
  }, [url, videoTagRef, onMaybeBlocked]);

  const handleAac = useCallback(async () => {
    if (!videoTagRef.current || !url?.aac) {
      return;
    }

    try {
      videoTagRef.current.src = url.aac;
    } catch (e) {
      setError(e);
    }

    try {
      await videoTagRef.current.play();
    } catch (e) {
      console.warn(e);
      onMaybeBlocked();
    }
  }, [url, videoTagRef, onMaybeBlocked]);

  useEffect(() => {
    const video = videoTagRef.current;
    if (!video || !url) {
      return;
    }

    if (playType === PlayType.Flv) {
      void handleFlv();
    } else if (playType === PlayType.Hls) {
      void handleHls();
    } else if (playType === PlayType.Aac) {
      void handleAac();
    }

    return () => {
      if (mpegtsPlayerRef.current) {
        mpegtsPlayerRef.current.destroy();
        mpegtsPlayerRef.current = undefined;
      }
      if (hlsPlayerRef.current) {
        hlsPlayerRef.current.destroy();
        hlsPlayerRef.current = undefined;
      }
      if (video) {
        video.pause();
        video.src = '';
      }
    };
  }, [videoTagRef, url, playType, handleFlv, handleHls, handleAac]);

  return {
    playType,
    setPlayType,
    play
  } as const;
};
