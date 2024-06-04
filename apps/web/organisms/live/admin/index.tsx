import {
  Box,
  Heading,
  Stack,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Tabs,
  Alert,
  AlertIcon,
  Button,
  Center,
  Spinner
} from '@chakra-ui/react';
import { FC, useEffect } from 'react';
import { useStream } from '~/utils/hooks/api/use-stream';
import { PushKey } from './stream-software/push-key';
import { CommentViewer } from './comment-viewer';
import { GeneralSettings } from './general-settings';
import Link from 'next/link';
import { LivePublic } from '~/../../packages/api-types/common/types';
import { AutoMods } from './auto-mods';
import { NewFeature } from '~/atoms/new-badge';
import { ConfigDescription } from './stream-software/config-description';
import { Stats } from './stream-software/stats';

type Props = {
  liveId: number;
  liveFallback?: LivePublic;
  tenantSlug: string;
  idInTenant: number;
};

export const Admin: FC<Props> = ({
  liveId,
  liveFallback,
  tenantSlug,
  idInTenant
}) => {
  const [stream, mutate] = useStream(liveId);

  const live = stream?.live;

  useEffect(() => {
    void mutate();
  }, [liveFallback, mutate]);

  if (!live) {
    return (
      <Center p={4}>
        <Spinner size="lg" />
      </Center>
    );
  }

  return (
    <Box border="1px" borderColor="teal.900" p={4} borderRadius={8}>
      <Stack spacing={4}>
        <Heading size="md">配信者パネル</Heading>

        <Box>
          {!stream?.live?.isPushing && (
            <Alert status="warning">
              <AlertIcon />
              映像がサーバーへプッシュされていません。「配信ソフトウェア設定」から設定を参照し、映像の送信を開始してください。
            </Alert>
          )}
          {!live.startedAt && (
            <Alert status="warning">
              <AlertIcon />
              配信が開始されていないため、現在は自分のみ視聴できます。「配信設定」から配信を開始してください。
            </Alert>
          )}
        </Box>

        <Tabs size="md" variant="enclosed" isLazy>
          <TabList>
            <Tab>配信設定</Tab>
            <Tab>配信ソフトウェア設定</Tab>
            <Tab>
              モデレーション
              <NewFeature />
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <GeneralSettings
                live={live}
                notPushing={!stream?.live?.isPushing}
              />
            </TabPanel>
            <TabPanel>
              <Stack spacing={6}>
                <Stats
                  isPushing={stream?.live?.isPushing}
                  stats={stream?.stats}
                />

                <Stack spacing={4}>
                  <Heading size="sm">配信サーバー設定</Heading>

                  {!stream?.live?.isPushing ? (
                    <PushKey liveId={live.id} />
                  ) : (
                    <Alert status="warning">
                      <AlertIcon />
                      配信中/システム準備中は表示できません
                    </Alert>
                  )}
                </Stack>

                <Stack spacing={4}>
                  <Heading size="sm">配信ソフトウェア設定</Heading>

                  <ConfigDescription />
                </Stack>

                <Stack spacing={4}>
                  <Heading size="sm">コメントビューワー</Heading>
                  <CommentViewer liveId={live.id} />
                </Stack>

                <Stack spacing={4}>
                  <Heading size="sm">ブラウザから配信</Heading>

                  <Button
                    href={`/@${tenantSlug}/${idInTenant}/broadcast-via-browser`}
                    as={Link}
                  >
                    ブラウザ配信ページへ移動
                  </Button>
                </Stack>
              </Stack>
            </TabPanel>
            <TabPanel>
              <AutoMods live={live} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </Box>
  );
};
