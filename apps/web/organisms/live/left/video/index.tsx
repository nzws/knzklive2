import { AspectRatio } from '@chakra-ui/react';
import styled from '@emotion/styled';
import type Mpegts from 'mpegts.js';
import type Hls from 'hls.js';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { usePlayerTouch } from '~/utils/hooks/use-player-touch';
import { Blocking } from './blocking';
import { Controller } from './controller';
import { PlayUrl } from 'api-types/api/v1/lives/_liveId@number/url';

export enum PlayType {
  Flv = 'FLV',
  Hls = 'HLS'
}

type Props = {
  url?: PlayUrl;
  updateUrl: () => Promise<unknown | undefined>;
  onToggleContainerSize: () => void;
  isStreamer?: boolean;
};

export const Video: FC<Props> = ({
  url,
  updateUrl,
  onToggleContainerSize,
  isStreamer
}) => {
  const intl = useIntl();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Mpegts.Player>();
  const hlsRef = useRef<Hls>();
  const lastPlayingRef = useRef(0);
  const [latency, setLatency] = useState<number>(-1);
  const [error, setError] = useState<unknown>();
  useAPIError(error);
  const [isBlocking, setIsBlocking] = useState(false);
  const [playType, setPlayType] = useState<PlayType>(PlayType.Flv);
  const { show, events } = usePlayerTouch();

  const autoSeek = useCallback(() => {
    void (async () => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      try {
        if (playerRef.current) {
          await playerRef.current.play();
        } else {
          await video.play();
        }
      } catch (e) {
        console.warn(e);
        setIsBlocking(true);
        return;
      }

      try {
        video.currentTime = video.buffered.end(0) - 2;
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  const toggleMaximize = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void container.requestFullscreen();
    }
  }, []);

  const togglePlayType = useCallback(() => {
    setPlayType(prev => {
      if (prev === PlayType.Flv) {
        return PlayType.Hls;
      }

      return PlayType.Flv;
    });
  }, []);

  useEffect(() => {
    void (async () => {
      if (!videoRef.current || !url || playType !== PlayType.Flv) {
        return;
      }

      let player;
      try {
        const Mpegts = (await import('mpegts.js')).default;

        if (!Mpegts.getFeatureList().mseLivePlayback) {
          setPlayType(PlayType.Hls);
          return;
        }

        player = Mpegts.createPlayer(
          {
            type: 'mse',
            isLive: true,
            url: url.wsFlv
          },
          {
            enableStashBuffer: false,
            stashInitialSize: 1024 * 64,
            enableWorker: true,
            autoCleanupSourceBuffer: true,
            liveBufferLatencyChasing: true
          }
        );
        playerRef.current = player;

        player.attachMediaElement(videoRef.current);
        player.load();
      } catch (e) {
        setError(e);
      }

      try {
        await player?.play();
      } catch (e) {
        console.warn(e);
        setIsBlocking(true);
      }
    })();

    return () => {
      playerRef.current?.destroy();
      playerRef.current = undefined;
    };
  }, [url, autoSeek, intl, playType]);

  useEffect(() => {
    void (async () => {
      if (!videoRef.current || !url || playType !== PlayType.Hls) {
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
          hlsRef.current = player;

          player.loadSource(url.hls);
          player.attachMedia(videoRef.current);
        } else if (
          videoRef.current.canPlayType('application/vnd.apple.mpegurl')
        ) {
          videoRef.current.src = url.hls;
          return;
        } else {
          throw new Error('HLS is not supported');
        }
      } catch (e) {
        setError(e);
      }

      try {
        await videoRef.current.play();
      } catch (e) {
        console.warn(e);
        setIsBlocking(true);
      }
    })();

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = undefined;
    };
  }, [url, autoSeek, intl, playType]);

  useEffect(() => {
    if (!url) {
      return;
    }

    const cleanup = setInterval(() => {
      const video = videoRef.current;
      const player = playerRef.current;
      if (!video || !player) {
        return;
      }

      let bufferTime = 0;
      try {
        bufferTime = video.buffered.end(0);
      } catch (e) {
        console.warn(e);
      }

      const playingTime = video.currentTime;
      if (bufferTime > playingTime && lastPlayingRef.current !== playingTime) {
        const delay = bufferTime - playingTime;
        setLatency(Math.round(delay * 10) / 10);
      } else {
        setLatency(-1);
      }

      lastPlayingRef.current = playingTime;
    }, 1000);

    return () => clearInterval(cleanup);
  }, [url, autoSeek]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleError = (e: ErrorEvent) => {
      setError(e.error);
    };

    const handleEnded = () => {
      void updateUrl();
    };

    const handlePlaying = () => {
      setIsBlocking(false);
    };

    const handleCanPlay = () => {
      //
    };

    const handleLoadedMetadata = () => {
      //
    };

    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [updateUrl]);

  return (
    <Container
      {...events}
      ref={containerRef}
      style={{
        cursor: show ? 'auto' : 'none'
      }}
    >
      <AspectRatio ratio={16 / 9}>
        <video ref={videoRef} autoPlay controls={false} />
      </AspectRatio>

      {isBlocking && <Blocking onClick={autoSeek} />}

      <Controller
        onLive={autoSeek}
        onToggleContainerSize={onToggleContainerSize}
        onToggleMaximize={toggleMaximize}
        onReload={() => void updateUrl()}
        isStreamer={isStreamer}
        videoRef={videoRef}
        show={show}
        latency={latency}
        playType={playType}
        onTogglePlayType={togglePlayType}
      />
    </Container>
  );
};

const Container = styled.div`
  position: relative;
`;
