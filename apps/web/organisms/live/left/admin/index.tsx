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
  UnorderedList,
  ListItem,
  Wrap,
  Button,
  WrapItem,
  useDisclosure,
  Tooltip
} from '@chakra-ui/react';
import { FC, useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { LivePublic } from 'api-types/common/types';
import { client } from '~/utils/api/client';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { useLive } from '~/utils/hooks/api/use-live';
import { useStream } from '~/utils/hooks/api/use-stream';
import { useAuth } from '~/utils/hooks/use-auth';
import { Dialog } from './dialog';
import { EditLiveModal } from './edit-live-modal';
import { PushKey } from './push-key';

type Props = {
  live: LivePublic;
};

export const Admin: FC<Props> = ({ live }) => {
  const { token } = useAuth();
  const [stream] = useStream(live.id);
  const [, mutate] = useLive(live.id, live);
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
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const notPushing = !!(stream?.pushLastEndedAt || !stream?.pushFirstStartedAt);

  const handlePublish = useCallback(
    (isStart: boolean) => {
      void (async () => {
        if (!token) {
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
          void mutate();
          onCloseStop();
          onCloseStart();
        } catch (e) {
          console.warn(e);
          setError(e);
        }
      })();
    },
    [live.id, token, mutate, onCloseStart, onCloseStop]
  );

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
              <Stack spacing={6}>
                <Wrap spacing={6}>
                  <WrapItem>
                    <Dialog
                      isOpen={isOpenStart}
                      onClose={onCloseStart}
                      onSubmit={() => handlePublish(true)}
                      title="配信を開始しますか？"
                      submitText="配信を開始"
                    />

                    <Tooltip
                      label={notPushing ? '先に映像をプッシュしてください' : ''}
                      shouldWrapChildren
                    >
                      <Button
                        size="lg"
                        colorScheme="green"
                        isDisabled={notPushing || !!live.startedAt}
                        onClick={onOpenStart}
                      >
                        配信を開始
                      </Button>
                    </Tooltip>
                  </WrapItem>

                  <WrapItem>
                    <Dialog
                      isOpen={isOpenStop}
                      onClose={onCloseStop}
                      onSubmit={() => handlePublish(false)}
                      title="配信を終了しますか？"
                      submitText="配信を終了"
                    />

                    <Button size="lg" colorScheme="red" onClick={onOpenStop}>
                      配信を終了
                    </Button>
                  </WrapItem>
                </Wrap>

                <Wrap>
                  <WrapItem>
                    <EditLiveModal
                      isOpen={isOpenLiveEdit}
                      onClose={onCloseLiveEdit}
                      live={live}
                    />

                    <Button onClick={onOpenLiveEdit}>配信情報を編集</Button>
                  </WrapItem>
                </Wrap>
              </Stack>
            </TabPanel>
            <TabPanel>
              <Stack spacing={6}>
                <Heading size="sm">配信サーバー設定</Heading>

                {notPushing ? (
                  <PushKey liveId={live.id} />
                ) : (
                  <Alert status="warning">
                    <AlertIcon />
                    配信中/システム準備中は表示できません
                  </Alert>
                )}

                <Heading size="sm">推奨の配信ソフトウェア設定</Heading>
                <UnorderedList>
                  <ListItem>ビットレート: 3000 Kbps くらい（たぶん）</ListItem>
                  <ListItem>キーフレーム間隔: 1</ListItem>
                  <ListItem>プリセット: veryfast</ListItem>
                </UnorderedList>
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
