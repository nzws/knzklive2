import { FC, Fragment, useCallback, useEffect, useState } from 'react';
import { VideoMessageBox } from '~/organisms/live/video/video-message-box';
import { UploadThumbnail } from '~/organisms/live/admin/live-info-modal/upload-thumbnail';
import { useAuth } from '~/utils/hooks/use-auth';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { ImagePublic } from '~/../../packages/api-types/common/types';
import { client } from '~/utils/api/client';
import { useToast } from '@chakra-ui/react';

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

  return (
    <Fragment>
      {isPushing ? (
        <UploadThumbnail
          thumbnailUrl={thumbnailUrl}
          onThumbnailChange={handleSubmit}
          onUploading={setIsLoading}
          tenantId={tenantId}
          streamerIdForDefaultThumbnail={streamerUserId}
          hideButton
        />
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
