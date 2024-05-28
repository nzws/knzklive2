import { FC, Fragment, useCallback, useEffect, useState } from 'react';
import { VideoMessageBox } from '~/organisms/live/video/video-message-box';
import { UploadThumbnail } from '~/organisms/live/admin/live-info-modal/upload-thumbnail';
import { useAuth } from '~/utils/hooks/use-auth';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { ImagePublic } from '~/../../packages/api-types/common/types';
import { client } from '~/utils/api/client';
import {
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  Portal,
  useDisclosure,
  useToast
} from '@chakra-ui/react';

type Props = {
  liveId?: number;
  tenantId?: number;
  thumbnailUrl?: string;
  isPushing?: boolean;
  streamerUserId: number;
};

export const LivePreview: FC<Props> = ({
  thumbnailUrl,
  isPushing,
  liveId,
  tenantId,
  streamerUserId
}) => {
  const { token } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen: popoverIsOpen, onClose: popoverOnClose } = useDisclosure({
    defaultIsOpen: true
  });
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const handleSubmit = useCallback(
    (thumbnail?: ImagePublic) => {
      if (!liveId || !token || !thumbnail) {
        return;
      }
      setIsLoading(true);

      void (async () => {
        try {
          await client.v1.streams._liveId(liveId).patch({
            body: {
              customThumbnailId: thumbnail.id
            },
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } catch (e) {
          console.warn(e);
          setError(e);
        } finally {
          setIsLoading(false);
        }
      })();
    },
    [token, liveId]
  );

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const uploading = toast({
      title: `サムネイルをアップロードしています...`,
      status: 'info'
    });

    return () => {
      toast.close(uploading);
    };
  }, [isLoading, toast]);

  useEffect(() => {
    if (!isPushing) {
      return;
    }

    const handler = () => {
      popoverOnClose();
    };

    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('click', handler);
    };
  }, [isPushing, popoverOnClose]);

  return (
    <Fragment>
      {isPushing ? (
        <Popover
          isOpen={popoverIsOpen}
          onClose={popoverOnClose}
          placement="bottom"
          closeOnBlur
          isLazy
          autoFocus={false}
          size="2xl"
          offset={[0, -16]}
        >
          <UploadThumbnail
            thumbnailUrl={thumbnailUrl}
            onThumbnailChange={handleSubmit}
            onUploading={setIsLoading}
            tenantId={tenantId}
            streamerIdForDefaultThumbnail={streamerUserId}
            hideButton
            thumbnailOuterComponent={PopoverAnchor}
          />

          <Portal>
            <PopoverContent shadow="2x">
              <PopoverArrow />

              <PopoverHeader textAlign="center" fontWeight="bold" fontSize="md">
                👆 ここをタップして画像を変更
              </PopoverHeader>

              <PopoverBody textAlign="center" fontSize="sm">
                変更はリアルタイムに視聴者へ同期されます。
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
      ) : (
        <VideoMessageBox
          thumbnailUrl={thumbnailUrl}
          streamerUserId={streamerUserId}
          messageIntl="live.not-pushed"
        />
      )}
    </Fragment>
  );
};
