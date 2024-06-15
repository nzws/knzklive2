import type Mpegts from 'mpegts.js';
import type Hls from 'hls.js';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { LiveUrls } from 'api-types/api/v1/lives/_liveId@number/url';
import { useAPIError } from './api/use-api-error';
import { VideoUrls } from 'api-types/api/v1/videos/_liveId@number';
import type { HlsConfig } from 'hls.js';
import { useLocalStorage } from 'react-use';

export enum LivePlayType {
  FlvWs = 'flvWs',
  FlvHttp = 'flvHttp',
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

let hlsInterface: typeof Hls | undefined;
let mpegtsInterface: typeof Mpegts | undefined;

const isLivePlayType = (type: string): type is LivePlayType =>
  Object.values(LivePlayType).includes(type as LivePlayType);

export const useVideoStream = <T extends 'live' | 'video'>(
  entityType: T,
  videoTagRef: RefObject<HTMLVideoElement>,
  url?: UrlType<T>
) => {
  const mpegtsPlayerRef = useRef<Mpegts.Player>();
  const hlsPlayerRef = useRef<Hls>();
  const [playType, setPlayType] = useLocalStorage<PlayType<T>>(
    `knzklive-${entityType}-play-type`
  );
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
        const Mpegts = mpegtsInterface || (await import('mpegts.js')).default;
        mpegtsInterface = Mpegts;

        if (!Mpegts.getFeatureList().mseLivePlayback) {
          throw new FlvNotSupportedError();
        }

        let flvConfig: Partial<Mpegts.Config> = {
          enableWorker: true,
          autoCleanupSourceBuffer: true,
          liveBufferLatencyChasing: true,
          liveBufferLatencyMinRemain: 0.2,
          // @ts-expect-error: type error
          enableWorkerForMSE: true,
          liveBufferLatencyChasingOnPaused: true,
          liveSync: true
        };

        const isLowLatency = LowLatency.includes(playType);
        if (isLowLatency) {
          flvConfig = {
            ...flvConfig,
            enableStashBuffer: false,
            liveBufferLatencyMaxLatency: 3,
            // @ts-expect-error: type error
            liveSyncTargetLatency: 0.5
          };
        }

        const player = Mpegts.createPlayer(
          {
            type: playType === LivePlayType.FlvWs ? 'mse' : 'flv',
            isLive: true,
            url
          },
          flvConfig
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
        const Hls = hlsInterface || (await import('hls.js')).default;
        hlsInterface = Hls;

        if (Hls.isSupported()) {
          if (isLive) {
            let hlsConfig: Partial<HlsConfig> = {
              enableWorker: true,
              liveDurationInfinity: true,
              startFragPrefetch: true,
              progressive: true,
              autoStartLoad: true
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

  const handleToLowerQuality = useCallback(() => {
    if (!playType) {
      return;
    }
    if (isLivePlayType(playType)) {
      const qualities = Object.values(LivePlayType);
      const currentIndex = qualities.indexOf(playType);
      const nextQuality = qualities[currentIndex + 1];
      if (nextQuality && nextQuality !== LivePlayType.Audio) {
        setPlayType(nextQuality as PlayType<T>);

        return true;
      }
    }

    return false;
  }, [playType, setPlayType]);

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
  }, [
    videoTagRef,
    url,
    playType,
    handleFlv,
    handleHls,
    entityType,
    setPlayType
  ]);

  return {
    playType,
    setPlayType,
    play,
    handleToLowerQuality
  } as const;
};

class FlvNotSupportedError extends Error {
  constructor() {
    super('FLV is not supported');
  }
}
