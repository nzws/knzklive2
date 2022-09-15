import { AspectRatio } from '@chakra-ui/react';
import styled from '@emotion/styled';
import type Mpegts from 'mpegts.js';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { usePlayerTouch } from '~/utils/hooks/use-player-touch';
import { Blocking } from './blocking';
import { Controller } from './controller';

type Props = {
  url?: string;
  updateUrl: () => Promise<string | undefined>;
  isStreamer?: boolean;
};

export const Video: FC<Props> = ({ url, updateUrl, isStreamer }) => {
  const intl = useIntl();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Mpegts.Player>();
  const lastPlayingRef = useRef(0);
  const [latency, setLatency] = useState<number>(-1);
  const [error, setError] = useState<unknown>();
  useAPIError(error);
  const [isBlocking, setIsBlocking] = useState(false);
  const { show, events } = usePlayerTouch();

  const autoSeek = useCallback(() => {
    void (async () => {
      const video = videoRef.current;
      const player = playerRef.current;
      if (!video || !player) {
        return;
      }

      try {
        await player.play();
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

  useEffect(() => {
    void (async () => {
      if (!videoRef.current || !url) {
        return;
      }

      let player;
      try {
        const Mpegts = (await import('mpegts.js')).default;

        if (!Mpegts.getFeatureList().mseLivePlayback) {
          throw new Error(
            intl.formatMessage({ id: 'live.player.not-supported' })
          );
        }

        player = Mpegts.createPlayer(
          {
            type: 'mse',
            isLive: true,
            url
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
      }
    })();

    return () => {
      playerRef.current?.destroy();
      playerRef.current = undefined;
    };
  }, [url, autoSeek, intl]);

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
    <Container {...events}>
      <AspectRatio ratio={16 / 9}>
        <video ref={videoRef} autoPlay />
      </AspectRatio>

      {isBlocking && <Blocking onClick={autoSeek} />}
      <Controller
        onLive={autoSeek}
        isStreamer={isStreamer}
        videoRef={videoRef}
        show={show}
        latency={latency}
      />
    </Container>
  );
};

const Container = styled.div`
  position: relative;
`;
