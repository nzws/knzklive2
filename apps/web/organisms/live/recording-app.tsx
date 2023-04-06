import {
  Box,
  Collapse,
  Container,
  Flex,
  Heading,
  Spacer,
  Stack,
  Text,
  useBreakpointValue
} from '@chakra-ui/react';
import { FC, useCallback, useState } from 'react';
import { LivePublic, UserPublic } from 'api-types/common/types';
import { useLiveRealtimeCount } from '~/utils/hooks/api/use-live-realtime-count';
import { useAuth } from '~/utils/hooks/use-auth';
import { Footer } from '../footer';
import { Comments } from './comment';
import { MobileTitle } from './mobile-title';
import { PublicStats } from './public-stats';
import { Streamer } from './streamer';
import { VideoMessageBox } from './video/video-message-box';
import { useMobileTitleEffect } from '~/utils/hooks/use-mobile-title-effect';
import { useVideo } from '~/utils/hooks/api/use-video';
import { VideoPlayer } from './video/video-player';

type Props = {
  live: LivePublic;
  streamer?: UserPublic;
};

const NAVBAR_HEIGHT = 56;

export const RecordingApp: FC<Props> = ({ live, streamer }) => {
  const { user } = useAuth();
  const isDesktop = useBreakpointValue(
    { base: false, lg: true },
    { fallback: 'lg' }
  );
  const { isOpen, toggle: toggleMobileDescription } =
    useMobileTitleEffect(isDesktop);
  const [isContainerMaximized, setIsContainerMaximized] = useState(false);
  const isStreamer = streamer && user?.id === streamer?.id;
  const [video] = useVideo(live.id);
  const [count] = useLiveRealtimeCount(!live.endedAt ? live.id : undefined);

  const toggleContainerSize = useCallback(
    () => setIsContainerMaximized(v => !v),
    []
  );

  const thumbnailUrl =
    live.thumbnail?.publicUrl ||
    `/api/default-thumbnail.png?userId=${streamer?.id || ''}`;

  const hasCache = !!video?.url.hlsHq;

  return (
    <Container
      maxW={isContainerMaximized ? '100%' : { base: '100%', lg: '2000px' }}
      padding={0}
    >
      <Flex
        height={{ lg: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}
        width="100%"
        direction={{ base: 'column', lg: 'row' }}
      >
        <Box
          overflowY="auto"
          width={{ lg: 'calc(100% - 400px)' }}
          flexShrink={0}
        >
          {hasCache ? (
            <VideoPlayer
              liveId={live.id}
              url={video.url}
              thumbnailUrl={thumbnailUrl}
              onToggleContainerSize={toggleContainerSize}
            />
          ) : (
            <VideoMessageBox
              thumbnailUrl={live.thumbnail?.publicUrl}
              streamerUserId={live.userId}
              messageIntl={
                video?.isOriginalDeleted
                  ? 'video.recording-deleted'
                  : video?.isCacheDeleted
                  ? 'video.cache-deleted'
                  : 'video.in-progress'
              }
            />
          )}

          {!isDesktop && (
            <MobileTitle title={live.title} onClick={toggleMobileDescription} />
          )}

          <Collapse in={isDesktop || isOpen} animateOpacity>
            <Stack spacing={4} p={4}>
              {isDesktop && <Heading>{live.title}</Heading>}

              <PublicStats
                startedAt={live.startedAt}
                endedAt={live.endedAt}
                currentViewers={count?.current}
                sumViewers={count?.sum || live.watchingSumCount}
                privacy={live.privacy}
                isRequiredFollower={live.isRequiredFollower}
                isRequiredFollowing={live.isRequiredFollowing}
                videoWatchers={video?.watchCount}
              />

              <Streamer
                displayName={streamer?.displayName}
                account={streamer?.account}
                avatarUrl={streamer?.avatarUrl}
                url={streamer?.url}
              />

              <Text>{live.description}</Text>
            </Stack>
          </Collapse>

          {isDesktop && <Footer />}
        </Box>

        <Spacer />

        <Box width={{ lg: '400px' }}>
          <Comments
            hashtag={live.hashtag}
            // todo: implement comment playback
            comments={[]}
            isLive={false}
            isStreamer={isStreamer}
            live={live}
          />
        </Box>
      </Flex>

      {!isDesktop && <Footer />}
    </Container>
  );
};
