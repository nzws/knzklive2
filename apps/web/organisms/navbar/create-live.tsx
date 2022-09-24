import { FC, useCallback, useRef, useState } from 'react';
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
  Text,
  Link,
  Collapse,
  FormHelperText,
  RadioGroup,
  Radio,
  Checkbox,
  Badge,
  AspectRatio,
  Image
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { getDocsUrl } from '~/utils/constants';
import { ImagePublic, LivePrivate } from 'api-types/common/types';
import { client } from '~/utils/api/client';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { TenantPublic } from 'api-types/common/types';
import { useAuth } from '~/utils/hooks/use-auth';
import { useRouter } from 'next/router';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  recentLive?: LivePrivate;
  tenant: TenantPublic;
};

const guidelineDocs = getDocsUrl('help/guideline');

export const CreateLive: FC<Props> = ({
  isOpen,
  onClose,
  recentLive,
  tenant
}) => {
  const { token } = useAuth();
  const intl = useIntl();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(recentLive?.title || '');
  const [privacy, setPrivacy] = useState<string>(
    recentLive?.privacy || 'Public'
  );
  const [hashTag, setHashTag] = useState(recentLive?.hashtag || '');
  const [sensitive, setSensitive] = useState(recentLive?.sensitive || false);
  const [preferThumbnailType, setPreferThumbnailType] = useState(
    recentLive?.config.preferThumbnailType || 'generate'
  );
  const [customThumbnail, setCustomThumbnail] = useState<
    ImagePublic | undefined
  >(
    recentLive?.config.preferThumbnailType === 'custom'
      ? recentLive?.thumbnail
      : undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const handleSubmit = useCallback(() => {
    void (async () => {
      if (!title || !privacy || !token) {
        return;
      }
      setIsLoading(true);

      try {
        const {
          body: { live }
        } = await client.v1.streams.post({
          body: {
            title,
            privacy: privacy as LivePrivate['privacy'],
            hashtag: hashTag,
            sensitive,
            tenantId: tenant.id,
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

        void router.push(`/watch/${live.idInTenant}`);
        onClose();
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
    hashTag,
    sensitive,
    token,
    tenant.id,
    router,
    onClose,
    preferThumbnailType,
    customThumbnail?.id
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
              tenantId: tenant.id,
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
    [token, tenant.id]
  );

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
        <ModalHeader>
          <FormattedMessage id="create-live.title" />
        </ModalHeader>
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
              <FormLabel>
                <FormattedMessage id="create-live.hashtag" />
              </FormLabel>

              <Input
                type="text"
                value={hashTag}
                onChange={e => setHashTag(e.target.value)}
                placeholder={intl.formatMessage({
                  id: 'create-live.hashtag.placeholder'
                })}
              />

              <FormHelperText>
                <FormattedMessage id="create-live.hashtag.note" />
              </FormHelperText>
            </FormControl>
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
                      objectFit="contain"
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
          <Stack spacing={4} width="100%">
            <Text>
              <FormattedMessage
                id="create-live.guideline"
                values={{
                  guideline: (
                    <Link href={guidelineDocs} isExternal>
                      <FormattedMessage id="create-live.guideline-link" />
                      <ExternalLinkIcon mx="2px" />
                    </Link>
                  )
                }}
              />
            </Text>

            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              width="100%"
              isLoading={isLoading}
            >
              <FormattedMessage id="create-live.submit" />
            </Button>
          </Stack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
