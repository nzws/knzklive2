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
  updateUrl: () => Promise<void>;
};

const preferLowLatency = (suc: number, err: number) =>
  err < 5 || suc > Math.max(err * 2, 60);

export const Video: FC<Props> = ({ url, updateUrl }) => {
  const intl = useIntl();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Mpegts.Player>();
  const successCountRef = useRef(0);
  const errorCountRef = useRef(0);
  const lastPlayingRef = useRef(0);
  const highLatencySeekRef = useRef(5);
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

      const isEnabledLowLatency = preferLowLatency(
        successCountRef.current,
        errorCountRef.current
      );
      if (isEnabledLowLatency) {
        highLatencySeekRef.current = 0;
      } else {
        highLatencySeekRef.current = Math.min(
          Math.max(5, highLatencySeekRef.current + 1),
          10
        );
      }

      video.currentTime =
        video.buffered.end(0) -
        (isEnabledLowLatency ? 2 : highLatencySeekRef.current);
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      if (!videoRef.current || !url) {
        return;
      }

      try {
        const Mpegts = (await import('mpegts.js')).default;

        if (!Mpegts.getFeatureList().mseLivePlayback) {
          throw new Error(
            intl.formatMessage({ id: 'live.player.not-supported' })
          );
        }

        const player = Mpegts.createPlayer(
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

        autoSeek();
      } catch (e) {
        setError(e);
      }
    })();
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
      try {
        const bufferTime = video.buffered.end(0);
        const playingTime = video.currentTime;

        const isEnabledLowLatency = preferLowLatency(
          successCountRef.current,
          errorCountRef.current
        );

        if (
          bufferTime > playingTime &&
          lastPlayingRef.current !== playingTime
        ) {
          const delay = bufferTime - playingTime;

          if (delay > 5 && isEnabledLowLatency) {
            autoSeek();
          }

          successCountRef.current++;
        } else {
          if (!highLatencySeekRef.current && isEnabledLowLatency) {
            successCountRef.current = 0;
            autoSeek();
          }

          errorCountRef.current++;
        }

        lastPlayingRef.current = playingTime;
      } catch (e) {
        console.warn(e);
        return;
      }
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
      setTimeout(() => {
        autoSeek();
        successCountRef.current = 0;
      }, 1000);
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
  }, [updateUrl, autoSeek]);

  return (
    <Container {...events}>
      <AspectRatio ratio={16 / 9}>
        <video ref={videoRef} />
      </AspectRatio>

      {isBlocking && <Blocking onClick={autoSeek} />}
      {show && <Controller onLive={autoSeek} videoRef={videoRef} />}
    </Container>
  );
};

const Container = styled.div`
  position: relative;
`;
