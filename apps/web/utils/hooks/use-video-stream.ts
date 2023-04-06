import type Mpegts from 'mpegts.js';
import type Hls from 'hls.js';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import {
  LiveUrls,
  PlaybackUrls
} from 'api-types/api/v1/lives/_liveId@number/url';
import { useAPIError } from './api/use-api-error';

export enum PlayType {
  Flv = 'flv',
  HlsHq = 'hlsHq',
  HlsLq = 'hlsLq',
  Audio = 'audio'
}

export const useVideoStream = (
  videoTagRef: RefObject<HTMLVideoElement>,
  url: LiveUrls | undefined
) => {
  const mpegtsPlayerRef = useRef<Mpegts.Player>();
  const hlsPlayerRef = useRef<Hls>();
  const [playType, setPlayType] = useState<PlayType>(PlayType.Flv);
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const play = useCallback(async () => {
    if (mpegtsPlayerRef.current) {
      await mpegtsPlayerRef.current.play();
    } else {
      await videoTagRef.current?.play();
    }
  }, [videoTagRef]);

  const handleFlv = useCallback(async () => {
    if (!videoTagRef.current || !url?.flv) {
      return;
    }

    try {
      const Mpegts = (await import('mpegts.js')).default;

      if (!Mpegts.getFeatureList().mseLivePlayback) {
        setPlayType(PlayType.HlsHq);
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
          liveBufferLatencyChasing: true,
          liveBufferLatencyMaxLatency: 2,
          liveBufferLatencyMinRemain: 0.5
        }
      );
      mpegtsPlayerRef.current = player;

      player.attachMediaElement(videoTagRef.current);
      player.load();
    } catch (e) {
      setError(e);
    }
  }, [url, videoTagRef]);

  const handleHls = useCallback(
    async (type: PlayType) => {
      if (
        !videoTagRef.current ||
        (type !== PlayType.HlsHq &&
          type !== PlayType.HlsLq &&
          type !== PlayType.Audio)
      ) {
        return;
      }
      const hlsUrl = url?.[type];
      if (!hlsUrl) {
        return;
      }

      let player: Hls;
      try {
        const Hls = (await import('hls.js')).default;

        if (Hls.isSupported()) {
          player = new Hls({
            enableWorker: true,
            maxBufferLength: 1,
            liveBackBufferLength: 0,
            liveSyncDuration: 0,
            liveMaxLatencyDuration: 5,
            liveDurationInfinity: true,
            highBufferWatchdogPeriod: 1,
            manifestLoadingMaxRetry: 4,
            progressive: true
          });
          hlsPlayerRef.current = player;

          player.loadSource(hlsUrl);
          player.attachMedia(videoTagRef.current);
          player.startLoad();

          player.on(Hls.Events.ERROR, (event, data) => {
            console.warn(event, data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR: {
                  if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
                    setTimeout(() => {
                      player.loadSource(hlsUrl);
                      player.startLoad();
                    }, 500);
                  } else {
                    player.startLoad();
                  }
                  break;
                }
                case Hls.ErrorTypes.MEDIA_ERROR:
                  player.recoverMediaError();
                  break;
                default:
                  player.destroy();
                  break;
              }
            }
          });
        } else if (
          videoTagRef.current.canPlayType('application/vnd.apple.mpegurl')
        ) {
          videoTagRef.current.src = hlsUrl;
          return;
        } else {
          throw new Error('HLS is not supported');
        }
      } catch (e) {
        setError(e);
      }
    },
    [url, videoTagRef]
  );

  useEffect(() => {
    const video = videoTagRef.current;
    if (!video || !url) {
      return;
    }

    if (playType === PlayType.Flv) {
      void handleFlv();
    } else if (playType === PlayType.HlsHq) {
      void handleHls(PlayType.HlsHq);
    } else if (playType === PlayType.HlsLq) {
      void handleHls(PlayType.HlsLq);
    } else if (playType === PlayType.Audio) {
      void handleHls(PlayType.Audio);
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
  }, [videoTagRef, url, playType, handleFlv, handleHls]);

  return {
    playType,
    setPlayType,
    play
  } as const;
};
