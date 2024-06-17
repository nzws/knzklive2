import { AspectRatio, Box, Center, Spinner } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { usePlayerTouch } from '~/utils/hooks/use-player-touch';
import { Blocking } from './blocking';
import { Controller } from './controller';
import { LiveUrls } from 'api-types/api/v1/lives/_liveId@number/url';
import { useVideoStream } from '~/utils/hooks/use-video-stream';
import { useMuxData } from '~/utils/hooks/use-mux-data';
import { CommentPublic } from 'api-types/common/types';
import { Gravity } from '~/utils/danmaku/gravity/jgravity-fork';

type Props = {
  thumbnailUrl: string;
  url?: LiveUrls;
  updateUrl: () => Promise<unknown>;
  onToggleContainerSize?: () => void;
  isStreamer?: boolean;
  streamerUserId: number;
  liveId?: number;
  liveTitle?: string;
  userId?: number;
  comments: CommentPublic[];
};

// コンポーネント再マウントしても保持したいのでとりあえず
let stealingCount = 0;

export const LivePlayer: FC<Props> = ({
  thumbnailUrl,
  url,
  updateUrl,
  onToggleContainerSize,
  isStreamer,
  liveId,
  liveTitle,
  userId,
  comments
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const danmakuRef = useRef<HTMLDivElement>(null);
  const gravityRef = useRef<Gravity | null>(null);
  const commentAddedRef = useRef<Set<number> | null>(null);
  const lastPlayingRef = useRef(0);
  const [latency, setLatency] = useState<number>(-1);
  const [error, setError] = useState<unknown>();
  useAPIError(error);
  const { show, events } = usePlayerTouch();
  const [canPlay, setCanPlay] = useState(false);
  const [maybeBlocked, setMaybeBlocked] = useState(false);
  const [danmaku, setDanmaku] = useState(true);
  const { playType, setPlayType, play, handleToLowerQuality } = useVideoStream(
    'live',
    videoRef,
    url
  );
  useMuxData(videoRef, liveId, liveTitle, userId, playType);

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

  useEffect(() => {
    const container = danmakuRef.current;
    if (!container || !danmaku) {
      return;
    }

    void (async () => {
      const gravity = new Gravity({}, container);
      await gravity.init();
      gravityRef.current = gravity;
    })();

    return () => {
      const gravity = gravityRef.current;
      if (gravity) {
        gravity.destroy();
        gravityRef.current = null;
      }
    };
  }, [danmaku]);

  useEffect(() => {
    if (!danmaku) {
      commentAddedRef.current = null;
      return;
    }
    if (!commentAddedRef.current) {
      const set = new Set<number>(comments.map(comment => comment.id));
      commentAddedRef.current = set;
      return;
    }

    const gravity = gravityRef.current;
    if (!gravity) {
      return;
    }

    const comment = comments[0];
    if (comment && !commentAddedRef.current?.has(comment.id)) {
      commentAddedRef.current.add(comment.id);
      const dom = gravity.add(comment.content, false);

      setTimeout(() => {
        gravity.remove(dom);
      }, 10 * 1000);
    }
  }, [comments, danmaku]);

  useEffect(() => {
    if (latency > 0 || !canPlay) {
      return;
    }

    const timeout = setTimeout(() => {
      // 長期間バッファチェック

      stealingCount++;
      console.warn('Stealing, count:', stealingCount);
      // 連続でバッファリングが発生した場合は画質を下げる
      if (stealingCount > 2) {
        stealingCount = 0;
        handleToLowerQuality();
        console.warn('Stealing, lower quality');
      }

      void updateUrl();
    }, 5 * 1000);

    return () => clearTimeout(timeout);
  }, [latency, handleToLowerQuality, canPlay, updateUrl]);

  return (
    <Box
      {...events}
      ref={containerRef}
      style={{
        cursor: show ? 'auto' : 'none'
      }}
      position="relative"
      borderTopRadius={{
        base: 8,
        md: 15
      }}
      overflow="hidden"
    >
      <VideoContainer
        ratio={16 / 9}
        style={{
          backgroundImage: `url(${thumbnailUrl})`
        }}
      >
        <video ref={videoRef} autoPlay playsInline controls={false} />
      </VideoContainer>

      <DanmakuContainer ref={danmakuRef} />

      {!canPlay && (
        <LoadingContainer>
          <Spinner size="xl" />
        </LoadingContainer>
      )}

      {maybeBlocked && canPlay && <Blocking onClick={autoSeek} />}

      <Controller
        isLive
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
        onChangeDanmaku={() => setDanmaku(prev => !prev)}
      />
    </Box>
  );
};

const VideoContainer = styled(AspectRatio)`
  background-color: #000;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
`;

const DanmakuContainer = styled(Box)`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  user-select: none;

  span {
    /* credit: https://qiita.com/NoxGit/items/eb0904822c0f0fe97650 */
    text-shadow:
      black 2px 0,
      black -2px 0,
      black 0 -2px,
      black 0 2px,
      black 2px 2px,
      black -2px 2px,
      black 2px -2px,
      black -2px -2px,
      black 1px 2px,
      black -1px 2px,
      black 1px -2px,
      black -1px -2px,
      black 2px 1px,
      black -2px 1px,
      black 2px -1px,
      black -2px -1px;

    font-size: 1.5rem;
    line-height: 1 !important;
    color: #fff !important;
    opacity: 0.7;
    white-space: nowrap;
    max-width: 100%;
    overflow-x: hidden;
    overflow-y: visible;

    ::-webkit-scrollbar {
      display: none;
    }

    @media (min-width: 768px) {
      font-size: 2rem;
    }
  }
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
