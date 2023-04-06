import { AspectRatio, Center, Spinner } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { usePlayerTouch } from '~/utils/hooks/use-player-touch';
import { Blocking } from './blocking';
import { Controller } from './controller';
import { useVideoStream } from '~/utils/hooks/use-video-stream';
import { VideoUrls } from 'api-types/api/v1/videos/_liveId@number';
import { client } from '~/utils/api/client';
import { useAuth } from '~/utils/hooks/use-auth';

type Props = {
  liveId: number;
  thumbnailUrl: string;
  url?: VideoUrls;
  onToggleContainerSize?: () => void;
  seek: number;
  setSeek: (seek: number) => void;
};

export const VideoPlayer: FC<Props> = ({
  liveId,
  thumbnailUrl,
  url,
  onToggleContainerSize,
  seek,
  setSeek
}) => {
  const { headers } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const eventLastSentRef = useRef<'playing' | 'paused' | 'ended' | undefined>();
  const [error, setError] = useState<unknown>();
  useAPIError(error);
  const { show, events } = usePlayerTouch();
  const [canPlay, setCanPlay] = useState(false);
  const [maybeBlocked, setMaybeBlocked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const { playType, setPlayType, play } = useVideoStream(
    'video',
    videoRef,
    url
  );

  const playVideo = useCallback(() => {
    void (async () => {
      try {
        await play();
        setPlaying(videoRef.current?.paused === false);
      } catch (e) {
        console.warn(e);
        setMaybeBlocked(true);
        return;
      }
    })();
  }, [play]);

  const handleSeek = useCallback(
    (seek: number) => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      video.currentTime = seek;
    },
    [videoRef]
  );

  const handlePause = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.pause();
  }, [videoRef]);

  const togglePlay = useCallback(() => {
    if (playing) {
      handlePause();
    } else {
      playVideo();
    }
  }, [playing, handlePause, playVideo]);

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
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const send = (ignoreDuplicate = true, ended?: boolean) => {
      const status = ended ? 'ended' : !video.paused ? 'playing' : 'paused';
      if (ignoreDuplicate && eventLastSentRef.current === status) {
        return;
      }

      void client.v1.videos._liveId(liveId).event.post({
        body: {
          status,
          seek: Math.round(video.currentTime)
        },
        headers
      });
    };

    const handleEnded = () => {
      send(false, true);
    };

    const handlePlay = () => {
      send();
    };

    const handlePause = () => {
      send();
    };

    video.addEventListener('ended', handleEnded);
    video.removeEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    const timer = setInterval(() => {
      if (video.paused) {
        return;
      }

      send(false);
    }, 10000);

    return () => {
      clearInterval(timer);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      eventLastSentRef.current = undefined;
    };
  }, [headers, liveId]);

  useEffect(() => {
    setSeek(0);
    setCanPlay(false);
    setMaybeBlocked(false);
    setPlaying(false);
  }, [liveId, setSeek]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleError = (e: ErrorEvent) => {
      setError(e.error);
    };

    const handlePlaying = () => {
      setMaybeBlocked(false);
      setCanPlay(true);
    };

    const handleCanPlay = () => {
      setCanPlay(true);
      playVideo();
      setDuration(video.duration);
    };

    const handleStopLoad = () => {
      setCanPlay(false);
    };

    const handleTimeUpdate = () => {
      setSeek(video.currentTime);
    };

    const handleSeeked = () => {
      setSeek(video.currentTime);
    };

    const handlePlay = () => {
      setPlaying(true);
    };

    const handlePause = () => {
      setPlaying(false);
    };

    video.addEventListener('error', handleError);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('emptied', handleStopLoad);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('emptied', handleStopLoad);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      setCanPlay(false);
    };
  }, [playVideo, setSeek]);

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
          backgroundImage: `url(${thumbnailUrl})`
        }}
        onClick={togglePlay}
      >
        <video ref={videoRef} autoPlay playsInline controls={false} />
      </VideoContainer>

      {!canPlay && (
        <LoadingContainer>
          <Spinner size="xl" />
        </LoadingContainer>
      )}

      {maybeBlocked && canPlay && <Blocking onClick={playVideo} />}

      <Controller
        isLive={false}
        onToggleContainerSize={onToggleContainerSize}
        onToggleMaximize={toggleMaximize}
        videoRef={videoRef}
        show={show || !playing}
        onPlay={playVideo}
        playType={playType}
        onChangePlayType={setPlayType}
        seek={seek}
        onSeek={handleSeek}
        videoSeconds={duration}
        onPause={handlePause}
        isPlaying={playing}
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
