import { NextPage } from 'next';
import Head from 'next/head';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Stack,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { LivePreview } from '~/organisms/stream/via-browser/live-preview';
import {
  FiMic,
  FiMicOff,
  FiMoreHorizontal,
  FiPlayCircle,
  FiRefreshCw
} from 'react-icons/fi';
import { useStream } from '~/utils/hooks/api/use-stream';
import { PublicStats } from '~/organisms/live/public-stats';
import { usePushViaBrowser } from '~/utils/hooks/api/use-push-via-browser';
import { useLiveRealtimeCount } from '~/utils/hooks/api/use-live-realtime-count';
import { CommentPost } from '~/organisms/live/comment-post';
import { WakeLock } from '~/organisms/stream/via-browser/wake-lock';
import { useLiveRealtime } from '~/utils/hooks/api/use-live-realtime';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { client } from '~/utils/api/client';
import { useAuth } from '~/utils/hooks/use-auth';
import { LiveInfoModal } from '~/organisms/live/admin/live-info-modal';
import { Dialog } from '~/organisms/live/admin/dialog';
import { FormattedMessage } from 'react-intl';
import { Comment } from '~/organisms/live/comment/comment';
import { useRouter } from 'next/router';
import { useWakeLock } from '~/utils/hooks/use-wake-lock';

const Page: NextPage<PageProps<Props, PathProps>> = ({
  props: { tenant: tenantFallback },
  pathProps: { tenantDomain }
}) => {
  const { token } = useAuth();
  const toast = useToast();
  const router = useRouter();
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
    connect
  } = usePushViaBrowser(live?.id);
  const [count] = useLiveRealtimeCount(!live?.endedAt ? live?.id : undefined);
  const {
    comments,
    live: realtimeLive,
    isConnecting: isConnectingStreaming,
    reconnect: reconnectStreaming
  } = useLiveRealtime(live?.id);
  const [error, setError] = useState<unknown>();
  useAPIError(error);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenStart,
    onOpen: onOpenStart,
    onClose: onCloseStart
  } = useDisclosure();
  const {
    isOpen: isOpenStop,
    onOpen: onOpenStop,
    onClose: onCloseStop
  } = useDisclosure();
  const {
    isOpen: isOpenLiveEdit,
    onOpen: onOpenLiveEdit,
    onClose: onCloseLiveEdit
  } = useDisclosure();

  const {
    isWakeLockSupported,
    isWakeLockEnabled,
    enableWakeLock,
    disableWakeLock
  } = useWakeLock();

  const handlePublish = useCallback(
    (isStart: boolean) => {
      void (async () => {
        if (!token || !live?.id) {
          return;
        }
        try {
          await client.v1.streams._liveId(live.id).action.post({
            body: {
              command: isStart ? 'publish' : 'end'
            },
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (!isStart) {
            void router.push('/');
          }
        } catch (e) {
          console.warn(e);
          setError(e);
        }
      })();
    },
    [live?.id, token, router]
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
      try {
        toast({
          title: 'エラー',
          description: '配信サーバーから切断されました',
          status: 'error',
          isClosable: true
        });
        void navigator.vibrate(500);
      } catch (e) {
        console.error(e);
      }
    }
  }, [live, toast]);

  useEffect(() => {
    if (!isConnectedWs || live?.startedAt || !live?.isPushing) {
      return;
    }

    handlePublish(true);
  }, [live, isConnectedWs, handlePublish]);

  useEffect(() => {
    void mutate();
  }, [realtimeLive, mutate]);

  return (
    <Container padding={0}>
      <Head>
        <title>
          {['ブラウザから配信', tenant?.displayName || tenant?.domain].join(
            ' - '
          )}
        </title>
      </Head>

      <StartedNote />

      <Dialog
        isOpen={isOpenStart}
        onClose={onCloseStart}
        onSubmit={() => void connect()}
        title="配信を開始しますか？マイクがオンになります。"
        submitText="配信を開始"
      />

      <Dialog
        isOpen={isOpenStop}
        onClose={onCloseStop}
        onSubmit={() => handlePublish(false)}
        title="配信を終了しますか？"
        submitText="配信を終了"
      />

      <Grid
        gridTemplateRows="auto 1fr auto"
        gridTemplateColumns="1fr"
        height="100vh"
      >
        <GridItem>
          <LivePreview
            isPushing={live?.isPushing}
            thumbnailUrl={live?.thumbnail?.publicUrl}
            liveId={live?.id}
            tenantId={tenant?.id}
          />
        </GridItem>

        <GridItem
          overflowY="auto"
          height="100%"
          as={Flex}
          gap={2}
          py={2}
          align="stretch"
          flexDirection="column-reverse"
        >
          {!isConnectingStreaming && (
            <Box>
              <Button
                colorScheme="blue"
                variant="outline"
                width="100%"
                onClick={reconnectStreaming}
              >
                <FormattedMessage id="live.comment.reconnect" />
              </Button>
            </Box>
          )}

          {comments.map(comment => (
            <Comment key={comment.id} comment={comment} isStreamer />
          ))}

          <Box>
            <Alert status="info">
              「ブラウザから配信」では、コメントは下から上に流れます。
            </Alert>
          </Box>
        </GridItem>

        <GridItem>
          <Stack>
            {live && <CommentPost liveId={live.id} hashtag={live.hashtag} />}

            <Flex gap={4} p={2}>
              {live?.startedAt ? (
                live.isPushing ? (
                  isVoiceMuted ? (
                    <Button
                      colorScheme="red"
                      leftIcon={<FiMicOff />}
                      onClick={() => setIsVoiceMuted(false)}
                    >
                      ミュート解除
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      colorScheme="blue"
                      leftIcon={<FiMic />}
                      onClick={() => setIsVoiceMuted(true)}
                    >
                      ミュート
                    </Button>
                  )
                ) : (
                  <Button
                    colorScheme="yellow"
                    leftIcon={<FiRefreshCw />}
                    onClick={() => void connect()}
                    isLoading={isConnectingWs || isConnectedWs}
                  >
                    サーバーに再接続
                  </Button>
                )
              ) : (
                <Button
                  colorScheme="green"
                  leftIcon={<FiPlayCircle />}
                  onClick={onOpenStart}
                  isLoading={isConnectingWs || isConnectedWs}
                >
                  配信を始める
                </Button>
              )}

              <Spacer />

              <Button variant="outline" onClick={onOpen}>
                <FiMoreHorizontal />
              </Button>
            </Flex>
          </Stack>
        </GridItem>
      </Grid>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>配信情報/設定</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Stack spacing={6}>
              {live && (
                <Stack spacing={4}>
                  <Heading size="md">{live.title}</Heading>

                  <PublicStats
                    startedAt={live.startedAt}
                    endedAt={live.endedAt}
                    currentViewers={count?.current}
                    sumViewers={count?.sum || live.watchingSumCount}
                    privacy={live.privacy}
                  />
                </Stack>
              )}

              {live?.startedAt && (
                <Button colorScheme="red" width="100%" onClick={onOpenStop}>
                  配信を終了
                </Button>
              )}

              <Divider />

              <Stack spacing={4}>
                <Heading size="sm">画面制御</Heading>

                <WakeLock
                  isWakeLockSupported={isWakeLockSupported}
                  isWakeLockEnabled={isWakeLockEnabled}
                  enableWakeLock={enableWakeLock}
                  disableWakeLock={disableWakeLock}
                />
              </Stack>

              <Divider />

              {live && (
                <LiveInfoModal
                  isOpen={isOpenLiveEdit}
                  onClose={onCloseLiveEdit}
                  live={live}
                  isCreate={false}
                  tenantId={live.tenantId}
                />
              )}

              <Button width="100%" onClick={onOpenLiveEdit}>
                配信情報を編集
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = defaultStaticProps;

export default Page;
