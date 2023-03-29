import {
  Button,
  Stack,
  Tooltip,
  useDisclosure,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import { FC, useCallback, useState } from 'react';
import { LivePrivate } from 'api-types/common/types';
import { Dialog } from '../dialog';
import { LiveInfoModal } from '../live-info-modal';
import { useAuth } from '~/utils/hooks/use-auth';
import { client } from '~/utils/api/client';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { StartModal } from '../start-modal';

type Props = {
  live: LivePrivate;
  notPushing: boolean;
};

export const GeneralSettings: FC<Props> = ({ live, notPushing }) => {
  const { token } = useAuth();
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

  const handlePublish = useCallback(
    async (isStart: boolean) => {
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
      } catch (e) {
        console.warn(e);
        setError(e);

        throw e;
      }
    },
    [live.id, token]
  );

  const handleStart = useCallback(async () => {
    await handlePublish(true);
  }, [handlePublish]);

  const handleEnd = useCallback(() => {
    void (async () => {
      await handlePublish(false);
      onCloseStop();
    })();
  }, [handlePublish, onCloseStop]);

  return (
    <Stack spacing={6}>
      <Wrap spacing={6}>
        <WrapItem>
          <StartModal
            isOpen={isOpenStart}
            onClose={onCloseStart}
            onPublish={handleStart}
            url={live.publicUrl}
            hashtag={live.hashtag}
            isBroadcastViaBrowser={false}
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
            onSubmit={handleEnd}
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
          <LiveInfoModal
            isOpen={isOpenLiveEdit}
            onClose={onCloseLiveEdit}
            live={live}
            isCreate={false}
            tenantId={live.tenant.id}
          />

          <Button onClick={onOpenLiveEdit}>配信情報を編集</Button>
        </WrapItem>
      </Wrap>
    </Stack>
  );
};
