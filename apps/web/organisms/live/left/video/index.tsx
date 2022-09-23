import { AspectRatio } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { usePlayerTouch } from '~/utils/hooks/use-player-touch';
import { Blocking } from './blocking';
import { Controller } from './controller';
import { PlayUrl } from 'api-types/api/v1/lives/_liveId@number/url';
import { useVideoStream } from '~/utils/hooks/use-video-stream';

type Props = {
  url?: PlayUrl;
  updateUrl: () => Promise<unknown | undefined>;
  onToggleContainerSize?: () => void;
  isStreamer?: boolean;
};

export const Video: FC<Props> = ({
  url,
  updateUrl,
  onToggleContainerSize,
  isStreamer
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPlayingRef = useRef(0);
  const [latency, setLatency] = useState<number>(-1);
  const [error, setError] = useState<unknown>();
  useAPIError(error);
  const [isBlocking, setIsBlocking] = useState(false);
  const { show, events } = usePlayerTouch();
  const { playType, setPlayType, play } = useVideoStream(
    videoRef,
    url,
    useCallback(() => setIsBlocking(true), [])
  );

  const autoSeek = useCallback(() => {
    void (async () => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      try {
        await play();
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
  }, [play]);

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

  useEffect(() => {
    if (!url) {
      return;
    }

    const cleanup = setInterval(() => {
      const video = videoRef.current;
      if (!video) {
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

    const handleLoadedMetadata = () => {
      autoSeek();
    };

    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('loadeddata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('loadeddata', handleLoadedMetadata);
    };
  }, [updateUrl, autoSeek]);

  return (
    <Container
      {...events}
      ref={containerRef}
      style={{
        cursor: show ? 'auto' : 'none'
      }}
    >
      <AspectRatio ratio={16 / 9}>
        <video ref={videoRef} autoPlay playsInline controls={false} />
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
        onChangePlayType={setPlayType}
      />
    </Container>
  );
};

const Container = styled.div`
  position: relative;
`;
