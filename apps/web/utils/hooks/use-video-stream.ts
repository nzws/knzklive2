import type Mpegts from 'mpegts.js';
import type Hls from 'hls.js';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { LiveUrls } from 'api-types/api/v1/lives/_liveId@number/url';
import { useAPIError } from './api/use-api-error';
import { VideoUrls } from 'api-types/api/v1/videos/_liveId@number';
import type { HlsConfig } from 'hls.js';

export enum LivePlayType {
  FlvHttp = 'flvHttp',
  FlvWs = 'flvWs',
  HlsHq = 'hlsHq',
  HlsLq = 'hlsLq',
  Audio = 'audio'
}

const LowLatency = [
  LivePlayType.FlvHttp,
  LivePlayType.FlvWs,
  LivePlayType.HlsHq,
  LivePlayType.Audio
];

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
    async (playType: LivePlayType, url: string) => {
      if (!videoTagRef.current) {
        return;
      }

      if (mpegtsPlayerRef.current) {
        mpegtsPlayerRef.current.destroy();
        mpegtsPlayerRef.current = undefined;
      }

      try {
        const Mpegts = (await import('mpegts.js')).default;

        if (!Mpegts.getFeatureList().mseLivePlayback) {
          throw new FlvNotSupportedError();
        }

        const player = Mpegts.createPlayer(
          {
            type: playType === LivePlayType.FlvWs ? 'mse' : 'flv',
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
            liveBufferLatencyMinRemain: 0.5,
            // @ts-expect-error: type error
            enableWorkerForMSE: true,
            liveBufferLatencyChasingOnPaused: true,
            liveSync: true,
            liveSyncTargetLatency: 0.5
          }
        );
        mpegtsPlayerRef.current = player;

        player.attachMediaElement(videoTagRef.current);
        player.load();
      } catch (e) {
        if (e instanceof FlvNotSupportedError) {
          throw e;
        }

        setError(e);
      }
    },
    [videoTagRef]
  );

  const handleHls = useCallback(
    async (
      url: string,
      playType: LivePlayType | VideoPlayType,
      isLive: boolean
    ) => {
      if (!videoTagRef.current) {
        return;
      }
      if (hlsPlayerRef.current) {
        hlsPlayerRef.current.destroy();
        hlsPlayerRef.current = undefined;
      }

      let player: Hls;
      try {
        const Hls = (await import('hls.js')).default;

        if (Hls.isSupported()) {
          if (isLive) {
            let hlsConfig: Partial<HlsConfig> = {
              enableWorker: true,
              liveDurationInfinity: true,
              startFragPrefetch: true,
              progressive: true
            };

            if (LowLatency.includes(playType as LivePlayType)) {
              hlsConfig = {
                ...hlsConfig,
                liveSyncDuration: 0,
                liveMaxLatencyDuration: 5,
                highBufferWatchdogPeriod: 1
              };
            }

            player = new Hls(hlsConfig);
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

            if (!data.fatal) {
              return;
            }

            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR: {
                if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
                  setTimeout(() => {
                    player.loadSource(url);
                    player.startLoad();
                  }, 1000);
                } else {
                  setTimeout(() => {
                    player.startLoad();
                  }, 1000);
                }
                break;
              }
              case Hls.ErrorTypes.MEDIA_ERROR:
                setTimeout(() => {
                  player.recoverMediaError();
                }, 1000);
                break;
              default:
                player.destroy();
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
      if (playType === LivePlayType.FlvHttp) {
        void (async () => {
          try {
            await handleFlv(playType, live.flvHttp);
          } catch (e) {
            if (e instanceof FlvNotSupportedError) {
              setPlayType(LivePlayType.HlsHq as PlayType<T>);
            }
          }
        })();
      } else if (playType === LivePlayType.FlvWs) {
        void (async () => {
          try {
            await handleFlv(playType, live.flvWs);
          } catch (e) {
            if (e instanceof FlvNotSupportedError) {
              setPlayType(LivePlayType.HlsHq as PlayType<T>);
            }
          }
        })();
      } else if (playType === LivePlayType.HlsHq) {
        void handleHls(live.hlsHq, playType, true);
      } else if (playType === LivePlayType.HlsLq) {
        void handleHls(live.hlsLq, playType, true);
      } else if (playType === LivePlayType.Audio) {
        void handleHls(live.audio, playType, true);
      } else {
        setPlayType(LivePlayType.FlvWs as PlayType<T>);
      }
    } else {
      const video = url as VideoUrls;
      if (playType === VideoPlayType.HlsHq) {
        // todo: lq でフォールバック？
        if (video.hlsHq) {
          void handleHls(video.hlsHq, playType, false);
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
