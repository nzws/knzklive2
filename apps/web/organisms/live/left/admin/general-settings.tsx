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
import { Dialog } from './dialog';
import { EditLiveModal } from './edit-live-modal';
import { useAuth } from '~/utils/hooks/use-auth';
import { client } from '~/utils/api/client';
import { useAPIError } from '~/utils/hooks/api/use-api-error';

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
          onCloseStop();
          onCloseStart();
        } catch (e) {
          console.warn(e);
          setError(e);
        }
      })();
    },
    [live.id, token, onCloseStart, onCloseStop]
  );

  return (
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
  );
};
