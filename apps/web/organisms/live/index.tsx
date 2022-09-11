import {
  Alert,
  AlertIcon,
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
import { FC, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { LivePublic } from '~/../server/src/models/live';
import { UserPublic } from '~/../server/src/models/user';
import { useStreamUrl } from '~/utils/hooks/api/use-stream-url';
import { useAuth } from '~/utils/hooks/use-auth';
import { Footer } from '../footer';
import { Comment } from './comment';
import { Admin } from './left/admin';
import { MobileTitle } from './left/mobile-title';
import { PublicStats } from './left/public-stats';
import { Streamer } from './left/streamer';
import { Video } from './left/video';

type Props = {
  live: LivePublic;
  streamer?: UserPublic;
};

const NAVBAR_HEIGHT = 56;

export const Live: FC<Props> = ({ live, streamer }) => {
  const { user } = useAuth();
  const isDesktop = useBreakpointValue(
    { base: false, xl: true },
    { fallback: 'xl' }
  );
  const { isOpen, onToggle } = useDisclosure();
  const isStreamer = streamer && user?.id === streamer?.id;
  const [url, updateUrl] = useStreamUrl(
    live.status !== 'Ended' ? live.id : undefined
  );

  // 仮
  const streamerUrl = useMemo(() => {
    if (!streamer?.account) {
      return;
    }
    const [user, domain] = streamer.account.split('@');

    return `https://${domain}/@${user}`;
  }, [streamer?.account]);

  return (
    <Container maxW={{ base: '100%', xl: '2000px' }} padding={0}>
      <Flex
        height={{ xl: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}
        flexDirection={{ base: 'column', xl: 'row' }}
      >
        <Box width="100%" overflowY="auto">
          {url ? (
            <Video url={url} updateUrl={updateUrl} />
          ) : (
            <Alert status="info">
              <AlertIcon />
              <FormattedMessage id="live.not-pushed" />
            </Alert>
          )}

          {!isDesktop && <MobileTitle title={live.title} onClick={onToggle} />}

          <Collapse in={isDesktop || isOpen} animateOpacity>
            <Stack spacing={4} p={4}>
              {isDesktop && <Heading>{live.title}</Heading>}

              <PublicStats
                startedAt={live.startedAt}
                endedAt={live.endedAt}
                viewingCount={9999}
              />

              <Streamer
                displayName={streamer?.displayName}
                account={streamer?.account}
                avatarUrl={streamer?.avatarUrl}
                url={streamerUrl}
              />

              <Text>{live.description}</Text>

              {isStreamer && live.status !== 'Ended' && <Admin live={live} />}
            </Stack>
          </Collapse>

          {isDesktop && <Footer />}
        </Box>

        <Spacer />

        <Box width={{ xl: '500px' }}>
          <Comment live={live} />
        </Box>
      </Flex>

      {!isDesktop && <Footer />}
    </Container>
  );
};
