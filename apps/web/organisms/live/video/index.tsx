import { AspectRatio, Center, Spinner } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { usePlayerTouch } from '~/utils/hooks/use-player-touch';
import { Blocking } from './blocking';
import { Controller } from './controller';
import { PlayUrl } from 'api-types/api/v1/lives/_liveId@number/url';
import { useVideoStream } from '~/utils/hooks/use-video-stream';

type Props = {
  thumbnailUrl?: string;
  url?: PlayUrl;
  updateUrl: () => Promise<unknown | undefined>;
  onToggleContainerSize?: () => void;
  isStreamer?: boolean;
  streamerUserId: number;
};

export const Video: FC<Props> = ({
  thumbnailUrl,
  url,
  updateUrl,
  onToggleContainerSize,
  isStreamer,
  streamerUserId
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPlayingRef = useRef(0);
  const [latency, setLatency] = useState<number>(-1);
  const [error, setError] = useState<unknown>();
  useAPIError(error);
  const { show, events } = usePlayerTouch();
  const [canPlay, setCanPlay] = useState(false);
  const [maybeBlocked, setMaybeBlocked] = useState(false);
  const { playType, setPlayType, play } = useVideoStream(videoRef, url);

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
        setMaybeBlocked(true);
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
      setCanPlay(false);
      void updateUrl();
    };

    const handlePlaying = () => {
      setMaybeBlocked(false);
      setCanPlay(true);
    };

    const handleCanPlay = () => {
      setCanPlay(true);
    };

    const handleStopLoad = () => {
      setCanPlay(false);
    };

    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('emptied', handleStopLoad);

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('emptied', handleStopLoad);
      setCanPlay(false);
    };
  }, [updateUrl]);

  useEffect(() => {
    if (canPlay) {
      void autoSeek();
    }
  }, [canPlay, autoSeek]);

  return (
    <Container
      {...events}
      ref={containerRef}
      style={{
        cursor: show ? 'auto' : 'none'
      }}
    >
      <VideoContainer
        ratio={16 / 9}
        style={{
          backgroundImage: `url(${
            thumbnailUrl ||
            `/api/default-thumbnail.png?userId=${streamerUserId}`
          })`
        }}
      >
        <video ref={videoRef} autoPlay playsInline controls={false} />
      </VideoContainer>

      {!canPlay && (
        <LoadingContainer>
          <Spinner size="xl" />
        </LoadingContainer>
      )}

      {maybeBlocked && canPlay && <Blocking onClick={autoSeek} />}

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

const VideoContainer = styled(AspectRatio)`
  background-color: #000;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
`;

const LoadingContainer = styled(Center)`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.15);
`;
