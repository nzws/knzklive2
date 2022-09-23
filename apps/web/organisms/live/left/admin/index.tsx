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
  Badge,
  Button
} from '@chakra-ui/react';
import { FC } from 'react';
import { FormattedMessage } from 'react-intl';
import { LivePublic } from 'api-types/common/types';
import { useLive } from '~/utils/hooks/api/use-live';
import { useStream } from '~/utils/hooks/api/use-stream';
import { PushKey } from './push-key';
import { CommentViewer } from './comment-viewer';
import { GeneralSettings } from './general-settings';
import Link from 'next/link';

type Props = {
  live: LivePublic;
};

export const Admin: FC<Props> = ({ live }) => {
  const [stream] = useStream(live.id);
  const [, mutate] = useLive(live.id, live);

  const notPushing = !!(stream?.pushLastEndedAt || !stream?.pushFirstStartedAt);

  return (
    <Box border="1px" borderColor="teal.900" p={4} borderRadius={8}>
      <Stack spacing={4}>
        <Heading size="md">配信者パネル</Heading>

        <Box>
          {notPushing && (
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

        <Tabs size="md" variant="enclosed">
          <TabList>
            <Tab>配信設定</Tab>
            <Tab>配信ソフトウェア設定</Tab>
            <Tab>モデレーション</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <GeneralSettings
                live={live}
                notPushing={notPushing}
                onStartPublish={() => void mutate()}
              />
            </TabPanel>
            <TabPanel>
              <Stack spacing={6}>
                <Stack spacing={4}>
                  <Heading size="sm">配信サーバー設定</Heading>

                  {notPushing ? (
                    <PushKey liveId={live.id} />
                  ) : (
                    <Alert status="warning">
                      <AlertIcon />
                      配信中/システム準備中は表示できません
                    </Alert>
                  )}
                </Stack>

                <Stack spacing={4}>
                  <Heading size="sm">コメントビューワー</Heading>
                  <CommentViewer liveId={live.id} />
                </Stack>

                <Stack spacing={4}>
                  <Heading size="sm">ブラウザから配信</Heading>

                  <Link href="/stream/via-browser" passHref>
                    <Button as="a">ブラウザ配信ページへ移動</Button>
                  </Link>
                </Stack>
              </Stack>
            </TabPanel>
            <TabPanel>
              <p>
                <Badge>
                  <FormattedMessage id="common.coming-soon" />
                </Badge>
                😇
              </p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </Box>
  );
};
