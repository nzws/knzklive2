import {
  Box,
  Collapse,
  Container,
  Flex,
  Heading,
  Spacer,
  Stack,
  Text,
  useBreakpointValue,
  useDisclosure
} from '@chakra-ui/react';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { LivePublic, UserPublic } from 'api-types/common/types';
import { useLiveRealtimeCount } from '~/utils/hooks/api/use-live-realtime-count';
import { useStreamUrl } from '~/utils/hooks/api/use-stream-url';
import { useAuth } from '~/utils/hooks/use-auth';
import { Footer } from '../footer';
import { Comments } from './comment';
import { Admin } from './left/admin';
import { CommentPost } from './left/comment-post';
import { MobileTitle } from './left/mobile-title';
import { PublicStats } from './left/public-stats';
import { Streamer } from './left/streamer';
import { Video } from './left/video';
import { NotPushed } from './left/video/not-pushed';

type Props = {
  live: LivePublic;
  streamer?: UserPublic;
};

const NAVBAR_HEIGHT = 56;

export const Live: FC<Props> = ({ live, streamer }) => {
  const { user } = useAuth();
  const isDesktop = useBreakpointValue(
    { base: false, lg: true },
    { fallback: 'lg' }
  );
  const { isOpen, onToggle, onOpen, onClose } = useDisclosure();
  const [isContainerMaximized, setIsContainerMaximized] = useState(false);
  const [isManuallyTapped, setIsManuallyTapped] = useState(false);
  const isStreamer = streamer && user?.id === streamer?.id;
  const [url, updateUrl] = useStreamUrl(
    !live.endedAt && live.isPushing ? live.id : undefined
  );
  const [count] = useLiveRealtimeCount(!live.endedAt ? live.id : undefined);

  // todo: 仮
  const streamerUrl = useMemo(() => {
    if (!streamer?.account) {
      return;
    }
    const [user, domain] = streamer.account.split('@');

    return `https://${domain}/@${user}`;
  }, [streamer?.account]);

  const toggleMobileDescription = useCallback(() => {
    setIsManuallyTapped(true);
    onToggle();
  }, [onToggle]);

  const toggleContainerSize = useCallback(
    () => setIsContainerMaximized(v => !v),
    []
  );

  useEffect(() => {
    if (isDesktop || isManuallyTapped) {
      return;
    }

    onOpen();
    const timeout = setTimeout(() => {
      onClose();
    }, 1.5 * 1000);

    return () => clearInterval(timeout);
  }, [isDesktop, isManuallyTapped, onOpen, onClose]);

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
          {url ? (
            <Video
              isStreamer={isStreamer}
              url={url}
              updateUrl={updateUrl}
              onToggleContainerSize={toggleContainerSize}
            />
          ) : (
            <NotPushed />
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
              />

              <Streamer
                displayName={streamer?.displayName}
                account={streamer?.account}
                avatarUrl={streamer?.avatarUrl}
                url={streamerUrl}
              />

              <Text>{live.description}</Text>

              {isStreamer && !live.endedAt && <Admin live={live} />}
            </Stack>
          </Collapse>

          {isDesktop && <Footer />}
        </Box>

        <Spacer />

        <Box width={{ lg: '400px' }}>
          <Comments live={live} isStreamer={isStreamer} />
        </Box>
      </Flex>

      {!isDesktop && <Footer />}
    </Container>
  );
};
