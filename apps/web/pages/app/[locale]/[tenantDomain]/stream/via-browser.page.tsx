import { NextPage } from 'next';
import Head from 'next/head';
import { Fragment, useCallback } from 'react';
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
  Button,
  Container,
  Divider,
  Heading,
  Icon,
  Stack,
  Text
} from '@chakra-ui/react';
import { LivePreview } from '~/organisms/stream/via-browser/live-preview';
import { FiMic, FiMicOff } from 'react-icons/fi';
import { NotStarted } from '~/organisms/stream/via-browser/not-started';
import { NotPushing } from '~/organisms/stream/via-browser/not-pushing';
import { useStream } from '~/utils/hooks/api/use-stream';
import { Comments } from '~/organisms/live/comment';
import { GeneralSettings } from '~/organisms/live/left/admin/general-settings';
import { PublicStats } from '~/organisms/live/left/public-stats';
import { usePushViaBrowser } from '~/utils/hooks/api/use-push-via-browser';
import { useLiveRealtimeCount } from '~/utils/hooks/api/use-live-realtime-count';
import { CommentPost } from '~/organisms/live/left/comment-post';

const Page: NextPage<PageProps<Props, PathProps>> = ({
  props: { tenant: tenantFallback },
  pathProps: { tenantDomain }
}) => {
  const [tenant] = useTenant(tenantDomain, tenantFallback);
  const [status] = useStreamStatus(tenant?.id);
  const liveId = status?.recently?.endedAt ? undefined : status?.recently?.id;
  const [stream] = useStream(liveId);
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

  const toggleMuted = useCallback(
    () => setIsVoiceMuted(prev => !prev),
    [setIsVoiceMuted]
  );
  const toggleConnect = useCallback(
    () => (isConnectedWs ? disconnect() : void connect()),
    [isConnectedWs, connect, disconnect]
  );

  return (
    <Container py={4}>
      <Head>
        <title>
          {['ブラウザーから配信', tenant?.displayName || tenant?.domain].join(
            ' - '
          )}
        </title>
      </Head>

      <StartedNote />

      <Stack spacing={6}>
        {status && !liveId && <StreamNotFound />}

        {live && (
          <Fragment>
            {!live.isPushing && <NotPushing />}
            {!live.startedAt && <NotStarted />}

            <LivePreview live={live} />

            <Stack spacing={4}>
              <Heading size="sm">映像</Heading>

              <Text>そのうち作成（現在は無映像）</Text>
            </Stack>

            <Stack spacing={4}>
              <Heading size="sm">音声</Heading>

              <Button onClick={toggleMuted} width="100%">
                <Icon mr={1} as={isVoiceMuted ? FiMicOff : FiMic} />
                {isVoiceMuted ? 'ミュート解除' : 'ミュート'}
              </Button>
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

              <Button
                onClick={toggleConnect}
                width="100%"
                isLoading={isConnectingWs}
              >
                {isConnectedWs ? 'サーバーから切断' : 'サーバーに接続'}
              </Button>
            </Stack>

            <Divider />

            <Stack spacing={4}>
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

            <Comments live={live} isStreamer />
          </Fragment>
        )}
      </Stack>
    </Container>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = defaultStaticProps;

export default Page;
