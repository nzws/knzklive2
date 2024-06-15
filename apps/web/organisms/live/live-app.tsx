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
import { FC, useCallback, useEffect, useState } from 'react';
import { LivePublic, UserPublic } from 'api-types/common/types';
import { useLiveRealtimeCount } from '~/utils/hooks/api/use-live-realtime-count';
import { useStreamUrl } from '~/utils/hooks/api/use-stream-url';
import { useAuth } from '~/utils/hooks/use-auth';
import { Footer } from '../footer';
import { Comments } from './comment';
import { Admin } from './admin';
import { CommentPost } from './comment-post';
import { MobileTitle } from './mobile-title';
import { PublicStats } from './public-stats';
import { Streamer } from './streamer';
import { LivePlayer } from './video/live-player';
import { VideoMessageBox } from './video/video-message-box';
import { useLiveRealtime } from '~/utils/hooks/api/use-live-realtime';
import { useLive } from '~/utils/hooks/api/use-live';
import { useMobileTitleEffect } from '~/utils/hooks/use-mobile-title-effect';

type Props = {
  live: LivePublic;
  streamer?: UserPublic;
};

const NAVBAR_HEIGHT = 56;

export const LiveApp: FC<Props> = ({ live, streamer }) => {
  const { user } = useAuth();
  const isDesktop = useBreakpointValue(
    { base: false, lg: true },
    { fallback: 'lg' }
  );
  const { isOpen, toggle: toggleMobileDescription } =
    useMobileTitleEffect(isDesktop);
  const [isContainerMaximized, setIsContainerMaximized] = useState(false);
  const isStreamer = streamer && user?.id === streamer?.id;
  const [url, updateUrl] = useStreamUrl(
    !live.endedAt && live.isPushing ? live.id : undefined
  );
  const [count] = useLiveRealtimeCount(!live.endedAt ? live.id : undefined);
  const [, mutate] = useLive(live.id);
  const {
    comments,
    live: realtimeLive,
    isConnecting: isConnectingStreaming,
    reconnect: reconnectStreaming
  } = useLiveRealtime(live.id);

  const thumbnailUrl =
    live.thumbnail?.publicUrl ||
    `/api/default-thumbnail.png?userId=${streamer?.id || ''}`;

  const toggleContainerSize = useCallback(
    () => setIsContainerMaximized(v => !v),
    []
  );

  useEffect(() => {
    if (!realtimeLive) {
      return;
    }

    void mutate(realtimeLive, { revalidate: false });
  }, [realtimeLive, mutate]);

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
          sx={{
            scrollbarWidth: 'none'
          }}
        >
          {url ? (
            <LivePlayer
              isStreamer={isStreamer}
              url={url}
              thumbnailUrl={thumbnailUrl}
              updateUrl={updateUrl}
              onToggleContainerSize={toggleContainerSize}
              streamerUserId={live.userId}
              liveId={live.id}
              liveTitle={live.title}
              userId={user?.id}
              comments={comments}
              key={url?.flvWs} // 強制再読み込み用
            />
          ) : (
            <VideoMessageBox
              thumbnailUrl={live.thumbnail?.publicUrl}
              streamerUserId={live.userId}
              messageIntl="live.not-pushed"
            />
          )}

          <CommentPost liveId={live.id} hashtag={live.hashtag} />

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
              />

              <Streamer
                displayName={streamer?.displayName}
                account={streamer?.account}
                avatarUrl={streamer?.avatarUrl}
                url={streamer?.url}
              />

              <Text>{live.description}</Text>

              {isStreamer && !live.endedAt && (
                <Admin
                  liveId={live.id}
                  tenantSlug={live.tenant.slug}
                  idInTenant={live.idInTenant}
                />
              )}
            </Stack>
          </Collapse>

          {isDesktop && <Footer />}
        </Box>

        <Spacer />

        <Box width={{ lg: '400px' }}>
          <Comments
            hashtag={live.hashtag}
            comments={comments}
            isConnectingStreaming={isConnectingStreaming}
            reconnectStreaming={reconnectStreaming}
            isStreamer={isStreamer}
            live={live}
            isLive
          />
        </Box>
      </Flex>

      {!isDesktop && <Footer />}
    </Container>
  );
};
