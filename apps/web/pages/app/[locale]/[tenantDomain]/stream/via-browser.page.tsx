import { NextPage } from 'next';
import Head from 'next/head';
import { Fragment, useCallback, useEffect, useRef } from 'react';
import { defaultGetStaticPaths } from '~/utils/data-fetching/default-static-paths';
import {
  defaultStaticProps,
  Props,
  PathProps
} from '~/utils/data-fetching/default-static-props';
import { PageProps } from '~/utils/data-fetching/get-all-static-props';
import { useTenant } from '~/utils/hooks/api/use-tenant';
import { StartedNote } from '~/organisms/stream/via-browser/started-note';
import { useStreamStatus } from '~/utils/hooks/api/use-stream-status';
import { StreamNotFound } from '~/organisms/stream/via-browser/stream-not-found';
import {
  AspectRatio,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Stack,
  Text,
  Tooltip
} from '@chakra-ui/react';
import { LivePreview } from '~/organisms/stream/via-browser/live-preview';
import { FiMic, FiMicOff, FiPlayCircle, FiRefreshCw } from 'react-icons/fi';
import { NotStarted } from '~/organisms/stream/via-browser/not-started';
import { NotPushing } from '~/organisms/stream/via-browser/not-pushing';
import { useStream } from '~/utils/hooks/api/use-stream';
import { Comments } from '~/organisms/live/comment';
import { GeneralSettings } from '~/organisms/live/left/admin/general-settings';
import { PublicStats } from '~/organisms/live/left/public-stats';
import { usePushViaBrowser } from '~/utils/hooks/api/use-push-via-browser';
import { useLiveRealtimeCount } from '~/utils/hooks/api/use-live-realtime-count';
import { CommentPost } from '~/organisms/live/left/comment-post';
import { WakeLock } from '~/organisms/stream/via-browser/wake-lock';
import { OLEDScreen } from '~/organisms/stream/via-browser/oled-screen';
import { useFullScreen } from '~/utils/hooks/use-full-screen';
import { useLiveRealtime } from '~/utils/hooks/api/use-live-realtime';

const Page: NextPage<PageProps<Props, PathProps>> = ({
  props: { tenant: tenantFallback },
  pathProps: { tenantDomain }
}) => {
  const isInitializedRef = useRef(false);
  const [tenant] = useTenant(tenantDomain, tenantFallback);
  const [status] = useStreamStatus(tenant?.id);
  const liveId = status?.recently?.endedAt ? undefined : status?.recently?.id;
  const [stream, mutate] = useStream(liveId);
  const live = stream?.live;
  const {
    isConnectingWs,
    isConnectedWs,
    isVoiceMuted,
    setIsVoiceMuted,
    connect,
    disconnect
  } = usePushViaBrowser(live?.id);
  const [count] = useLiveRealtimeCount(!live?.endedAt ? live?.id : undefined);
  const { isEnabledFullScreen, handleEnterFullScreen, handleExitFullScreen } =
    useFullScreen();
  const {
    comments,
    live: realtimeLive,
    isConnecting: isConnectingStreaming,
    reconnect: reconnectStreaming
  } = useLiveRealtime(live?.id);

  const toggleMuted = useCallback(
    () => setIsVoiceMuted(prev => !prev),
    [setIsVoiceMuted]
  );
  const toggleConnect = useCallback(
    () => (isConnectedWs ? disconnect() : void connect()),
    [isConnectedWs, connect, disconnect]
  );

  useEffect(() => {
    if (!live) {
      return;
    }

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }

    if (!live.isPushing && !live.endedAt) {
      handleExitFullScreen();

      try {
        void navigator.vibrate(500);
      } catch (e) {
        console.error(e);
      }
    }
  }, [live, handleExitFullScreen]);

  useEffect(() => {
    void mutate();
  }, [realtimeLive, mutate]);

  return (
    <Container py={4}>
      <Head>
        <title>
          {['ブラウザから配信', tenant?.displayName || tenant?.domain].join(
            ' - '
          )}
        </title>
      </Head>

      <Grid gridTemplateRows="auto 1fr 48px">
        <GridItem>
          <LivePreview
            isPushing={live?.isPushing}
            thumbnailUrl={live?.thumbnail?.publicUrl}
          />
        </GridItem>

        <GridItem>
          <Box>「ブラウザから配信」では、コメントは下から上に流れます。</Box>
        </GridItem>

        <GridItem>
          <Flex>
            {live?.startedAt ? (
              live.isPushing ? (
                isVoiceMuted ? (
                  <Button
                    flexShrink={0}
                    variant="outline"
                    colorScheme="red"
                    leftIcon={<FiMicOff />}
                  >
                    ミュート解除
                  </Button>
                ) : (
                  <Button
                    flexShrink={0}
                    variant="outline"
                    colorScheme="blue"
                    leftIcon={<FiMic />}
                  >
                    ミュート
                  </Button>
                )
              ) : (
                <Button
                  flexShrink={0}
                  colorScheme="yellow"
                  leftIcon={<FiRefreshCw />}
                >
                  サーバーに再接続
                </Button>
              )
            ) : (
              <Button
                flexShrink={0}
                colorScheme="green"
                leftIcon={<FiPlayCircle />}
              >
                配信を始める
              </Button>
            )}

            <Button>設定</Button>
          </Flex>
        </GridItem>
      </Grid>

      <Stack spacing={6}>
        {status && !liveId && <StreamNotFound />}

        {live && (
          <Fragment>
            <Stack spacing={4}>
              <Heading size="sm">画面制御</Heading>

              <WakeLock />
            </Stack>

            <Stack spacing={4}>
              <Heading size="sm">
                プッシュ状態
                {isConnectedWs ? (
                  <Text as="span" ml={2} color="green.500">
                    接続中
                  </Text>
                ) : (
                  <Text as="span" ml={2} color="red.500">
                    未接続
                  </Text>
                )}
              </Heading>

              <Tooltip
                label={
                  !isConnectedWs && isVoiceMuted
                    ? 'ミュート中は接続開始できません'
                    : ''
                }
                shouldWrapChildren
              >
                <Button
                  onClick={toggleConnect}
                  width="100%"
                  isLoading={isConnectingWs}
                  isDisabled={!isConnectedWs && isVoiceMuted}
                >
                  {isConnectedWs ? 'サーバーから切断' : 'サーバーに接続'}
                </Button>
              </Tooltip>
            </Stack>

            <Divider />

            <Stack spacing={4}>
              <Button
                onClick={() => void mutate()}
                width="100%"
                variant="outline"
                size="sm"
                leftIcon={<FiRefreshCw />}
              >
                最新の状態に更新
              </Button>

              <Heading size="md">{live.title}</Heading>

              <PublicStats
                startedAt={live.startedAt}
                endedAt={live.endedAt}
                currentViewers={count?.current}
                sumViewers={count?.sum || live.watchingSumCount}
                privacy={live.privacy}
              />

              <GeneralSettings live={live} notPushing={!live.isPushing} />
            </Stack>

            <CommentPost liveId={live.id} hashtag={live.hashtag} />

            <Comments
              comments={comments}
              isConnectingStreaming={isConnectingStreaming}
              reconnectStreaming={reconnectStreaming}
              isStreamer
            />
          </Fragment>
        )}
      </Stack>
    </Container>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = defaultStaticProps;

export default Page;
