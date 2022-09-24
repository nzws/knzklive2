import { FC, useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  Input,
  FormLabel,
  Stack,
  Collapse,
  FormHelperText,
  RadioGroup,
  Radio,
  Checkbox,
  Badge,
  Textarea,
  Alert,
  AlertIcon,
  Image,
  AspectRatio
} from '@chakra-ui/react';
import { ImagePublic, LivePrivate } from 'api-types/common/types';
import { client } from '~/utils/api/client';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { useAuth } from '~/utils/hooks/use-auth';
import { FormattedMessage } from 'react-intl';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  live: LivePrivate;
  onSubmitted?: () => void;
};

// todo: 配信開始モーダルと統合

export const EditLiveModal: FC<Props> = ({
  isOpen,
  onClose,
  live,
  onSubmitted
}) => {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(live.title);
  const [description, setDescription] = useState(live.description || '');
  const [privacy, setPrivacy] = useState<string>(live.privacy || 'Public');
  const [sensitive, setSensitive] = useState(live.sensitive || false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  useAPIError(error);
  const [preferThumbnailType, setPreferThumbnailType] = useState(
    live.config.preferThumbnailType || 'generate'
  );
  const [customThumbnail, setCustomThumbnail] = useState<
    ImagePublic | undefined
  >(live.config.preferThumbnailType === 'custom' ? live.thumbnail : undefined);

  const handleSubmit = useCallback(() => {
    void (async () => {
      if (!title || !privacy || !token) {
        return;
      }
      setIsLoading(true);

      try {
        await client.v1.streams._liveId(live.id).patch({
          body: {
            title,
            privacy: privacy as LivePrivate['privacy'],
            sensitive,
            description,
            config: {
              preferThumbnailType
            },
            ...(preferThumbnailType === 'custom' &&
              !!customThumbnail?.id && {
                customThumbnailId: customThumbnail.id
              })
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        onClose();
        onSubmitted && onSubmitted();
      } catch (e) {
        console.warn(e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [
    title,
    privacy,
    token,
    live.id,
    onClose,
    onSubmitted,
    sensitive,
    description,
    customThumbnail?.id,
    preferThumbnailType
  ]);

  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !token) {
        return;
      }

      void (async () => {
        try {
          if (file.size > 5 * 1024 * 1024) {
            throw new Error(
              'ファイルサイズが大きすぎます: 5MB までの画像ファイルが使用できます。'
            );
          }

          setIsLoading(true);
          const { body } = await client.v1.streams.thumbnail.post({
            body: {
              tenantId: live.tenantId,
              file
            },
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          setCustomThumbnail(body);
        } catch (e) {
          console.warn(e);
          setError(e);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } finally {
          setIsLoading(false);
        }
      })();
    },
    [token, live.tenantId]
  );

  useEffect(() => {
    setTitle(live.title);
    setDescription(live.description || '');
    setPrivacy(live.privacy || 'Public');
    setSensitive(live.sensitive || false);
    setPreferThumbnailType(live.config.preferThumbnailType || 'generate');
    setCustomThumbnail(
      live.config.preferThumbnailType === 'custom' ? live.thumbnail : undefined
    );
  }, [
    live.title,
    live.description,
    live.privacy,
    live.sensitive,
    live.config,
    live.thumbnail
  ]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="xl"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>配信を編集</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Stack spacing={6}>
            <FormControl isRequired>
              <FormLabel>
                <FormattedMessage id="create-live.input-title" />
              </FormLabel>

              <Input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>配信の説明文</FormLabel>

              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </FormControl>

            <Collapse in={privacy !== live.privacy} animateOpacity>
              <Alert status="warning" size="sm">
                <AlertIcon />
                現時点では公開範囲を配信中に変更しても、コメントサーバーや配信サーバーとは自動的に切断されません。
                <br />
                確実に管理するには配信ソフトウェアから切断→再接続を行うか、枠を取り直してください。
              </Alert>
            </Collapse>

            <FormControl isRequired>
              <FormLabel as="legend">
                <FormattedMessage id="create-live.privacy" />
              </FormLabel>

              <RadioGroup value={privacy} onChange={value => setPrivacy(value)}>
                <Stack spacing={4}>
                  <Radio value="Public">
                    <FormattedMessage id="create-live.privacy.public" />
                  </Radio>

                  <Radio value="Private">
                    <FormattedMessage id="create-live.privacy.private" />
                  </Radio>
                </Stack>
              </RadioGroup>

              <FormHelperText>
                <FormattedMessage id="create-live.privacy.private.note" />
              </FormHelperText>
            </FormControl>

            <Collapse in={privacy === 'Private'} animateOpacity>
              <Badge>
                <FormattedMessage id="common.coming-soon" />
              </Badge>

              <Stack spacing={4}>
                <Checkbox isDisabled>
                  <FormattedMessage id="create-live.privacy.private.require-follower" />
                </Checkbox>
                <Checkbox isDisabled>
                  <FormattedMessage id="create-live.privacy.private.require-following" />
                </Checkbox>
              </Stack>
            </Collapse>

            <FormControl>
              <Checkbox
                isChecked={sensitive}
                onChange={e => setSensitive(e.target.checked)}
              >
                <FormattedMessage id="create-live.sensitive" />
              </Checkbox>

              <FormHelperText>
                <FormattedMessage id="create-live.sensitive.note" />
              </FormHelperText>
            </FormControl>

            <FormControl>
              <Checkbox
                isChecked={preferThumbnailType === 'custom'}
                onChange={e =>
                  setPreferThumbnailType(
                    e.target.checked ? 'custom' : 'generate'
                  )
                }
              >
                カスタムのサムネイル画像を使用する
              </Checkbox>

              <FormHelperText>
                デフォルトではプッシュ開始時に自動的にキャプチャされます。
              </FormHelperText>
            </FormControl>

            <Collapse in={preferThumbnailType === 'custom'} animateOpacity>
              <Stack spacing={4}>
                <Button
                  variant="outline"
                  width="100%"
                  onClick={handleOpenFile}
                  isLoading={isLoading}
                >
                  新しくアップロード
                </Button>
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />

                {customThumbnail && (
                  <AspectRatio ratio={16 / 9}>
                    <Image
                      src={customThumbnail.publicUrl}
                      style={{
                        objectFit: 'contain'
                      }}
                      alt="image"
                    />
                  </AspectRatio>
                )}
              </Stack>
            </Collapse>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            width="100%"
            isLoading={isLoading}
          >
            編集
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
