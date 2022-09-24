import { Button, Stack, useDisclosure } from '@chakra-ui/react';
import { FC, Fragment } from 'react';
import { LivePublic } from 'api-types/common/types';
import { Video } from '~/organisms/live/left/video';
import { useStreamUrl } from '~/utils/hooks/api/use-stream-url';
import { NotPushed } from '~/organisms/live/left/video/not-pushed';

type Props = {
  live: LivePublic;
};

export const LivePreview: FC<Props> = ({ live }) => {
  const { isOpen, onToggle } = useDisclosure();
  const [url, updateUrl] = useStreamUrl(
    !live.endedAt && live.isPushing ? live.id : undefined
  );

  return (
    <Stack spacing={4}>
      <Button onClick={onToggle} variant="outline" size="sm" width="100%">
        {isOpen ? '閉じる' : '配信画面を確認する'}
      </Button>

      {isOpen && (
        <Fragment>
          {live.isPushing ? (
            <Video
              url={url}
              updateUrl={updateUrl}
              thumbnailUrl={live.thumbnail?.publicUrl}
              isStreamer
            />
          ) : (
            <NotPushed thumbnailUrl={live.thumbnail?.publicUrl} />
          )}
        </Fragment>
      )}
    </Stack>
  );
};
