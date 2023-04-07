import type Mpegts from 'mpegts.js';
import type Hls from 'hls.js';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { LiveUrls } from 'api-types/api/v1/lives/_liveId@number/url';
import { useAPIError } from './api/use-api-error';
import { VideoUrls } from 'api-types/api/v1/videos/_liveId@number';

export enum LivePlayType {
  Flv = 'flv',
  HlsHq = 'hlsHq',
  HlsLq = 'hlsLq',
  Audio = 'audio'
}

export enum VideoPlayType {
  HlsHq = 'hlsHq'
}

export type PlayType<T> = T extends 'live' ? LivePlayType : VideoPlayType;
type UrlType<T> = T extends 'live' ? LiveUrls : VideoUrls;

export const useVideoStream = <T extends 'live' | 'video'>(
  entityType: T,
  videoTagRef: RefObject<HTMLVideoElement>,
  url?: UrlType<T>
) => {
  const mpegtsPlayerRef = useRef<Mpegts.Player>();
  const hlsPlayerRef = useRef<Hls>();
  const [playType, setPlayType] = useState<PlayType<T>>();
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const play = useCallback(async () => {
    if (mpegtsPlayerRef.current) {
      await mpegtsPlayerRef.current.play();
    } else {
      await videoTagRef.current?.play();
    }
  }, [videoTagRef]);

  const handleFlv = useCallback(
    async (url: string) => {
      if (!videoTagRef.current) {
        return;
      }

      try {
        const Mpegts = (await import('mpegts.js')).default;

        if (!Mpegts.getFeatureList().mseLivePlayback) {
          throw new FlvNotSupportedError();
        }

        const player = Mpegts.createPlayer(
          {
            type: 'flv',
            isLive: true,
            url
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
    },
    [videoTagRef]
  );

  const handleHls = useCallback(
    async (url: string, isLive: boolean) => {
      if (!videoTagRef.current) {
        return;
      }

      let player: Hls;
      try {
        const Hls = (await import('hls.js')).default;

        if (Hls.isSupported()) {
          if (isLive) {
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
          } else {
            player = new Hls({
              enableWorker: true
            });
          }
          hlsPlayerRef.current = player;

          player.loadSource(url);
          player.attachMedia(videoTagRef.current);
          player.startLoad();

          player.on(Hls.Events.ERROR, (event, data) => {
            console.warn(event, data);

            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR: {
                if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
                  setTimeout(() => {
                    player.loadSource(url);
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
                if (data.fatal) {
                  player.destroy();
                }
                break;
            }
          });
        } else if (
          videoTagRef.current.canPlayType('application/vnd.apple.mpegurl')
        ) {
          videoTagRef.current.src = url;
          return;
        } else {
          throw new Error('HLS is not supported');
        }
      } catch (e) {
        setError(e);
      }
    },
    [videoTagRef]
  );

  useEffect(() => {
    const video = videoTagRef.current;
    if (!video || !url) {
      return;
    }

    if (entityType === 'live') {
      const live = url as LiveUrls;
      if (playType === LivePlayType.Flv) {
        void (async () => {
          try {
            await handleFlv(live.flv);
          } catch (e) {
            if (e instanceof FlvNotSupportedError) {
              setPlayType(LivePlayType.HlsLq as PlayType<T>);
            }
          }
        })();
      } else if (playType === LivePlayType.HlsHq) {
        void handleHls(live.hlsHq, true);
      } else if (playType === LivePlayType.HlsLq) {
        void handleHls(live.hlsLq, true);
      } else if (playType === LivePlayType.Audio) {
        void handleHls(live.audio, true);
      } else {
        setPlayType(LivePlayType.Flv as PlayType<T>);
      }
    } else {
      const video = url as VideoUrls;
      if (playType === VideoPlayType.HlsHq) {
        // todo: lq でフォールバック？
        if (video.hlsHq) {
          void handleHls(video.hlsHq, false);
        }
      } else {
        setPlayType(VideoPlayType.HlsHq as PlayType<T>);
      }
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
  }, [videoTagRef, url, playType, handleFlv, handleHls, entityType]);

  return {
    playType,
    setPlayType,
    play
  } as const;
};

class FlvNotSupportedError extends Error {
  constructor() {
    super('FLV is not supported');
  }
}
