import { AspectRatio, Button, Image, Stack } from '@chakra-ui/react';
import styled from '@emotion/styled';
import {
  ChangeEvent,
  FC,
  Fragment,
  useCallback,
  useRef,
  useState
} from 'react';
import { ImagePublic } from '~/../../packages/api-types/common/types';
import { client } from '~/utils/api/client';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { useAuth } from '~/utils/hooks/use-auth';

type Props = {
  thumbnailUrl?: string;
  onThumbnailChange: (thumbnail: ImagePublic | undefined) => void;
  onUploading: (isUploading: boolean) => void;
  tenantId?: number;
  hideButton?: boolean;
};

export const UploadThumbnail: FC<Props> = ({
  thumbnailUrl,
  onThumbnailChange,
  onUploading,
  tenantId,
  hideButton
}) => {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !token || !tenantId) {
        return;
      }

      try {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(
            'ファイルサイズが大きすぎます: 5MB までの画像ファイルが使用できます。'
          );
        }

        onUploading(true);
        setIsLoading(true);

        const { body } = await client.v1.streams.thumbnail.post({
          body: {
            tenantId,
            file
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        onThumbnailChange(body);
      } catch (e) {
        console.warn(e);
        setError(e);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } finally {
        onUploading(false);
        setIsLoading(false);
      }
    },
    [token, tenantId, onThumbnailChange, onUploading]
  );

  return (
    <Fragment>
      <input
        type="file"
        hidden
        ref={fileInputRef}
        onChange={e => void handleFileChange(e)}
        style={{ display: 'none' }}
      />

      <Stack spacing={4}>
        {!hideButton && (
          <Button
            variant="outline"
            width="100%"
            onClick={handleOpenFile}
            isLoading={isLoading}
          >
            新しくアップロード
          </Button>
        )}

        <VideoContainer
          ratio={16 / 9}
          onClick={isLoading ? undefined : handleOpenFile}
        >
          {thumbnailUrl && (
            <Image
              src={thumbnailUrl}
              style={{
                objectFit: 'contain'
              }}
              alt="image"
            />
          )}
        </VideoContainer>
      </Stack>
    </Fragment>
  );
};

const VideoContainer = styled(AspectRatio)`
  background-color: #000;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
`;
