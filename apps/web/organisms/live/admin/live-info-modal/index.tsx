import { FC, Fragment, useCallback, useEffect, useState } from 'react';
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
  Textarea,
  Text,
  Link
} from '@chakra-ui/react';
import { ImagePublic, LivePrivate, LivePublic } from 'api-types/common/types';
import { client } from '~/utils/api/client';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { useAuth } from '~/utils/hooks/use-auth';
import { FormattedMessage, useIntl } from 'react-intl';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { FiArrowRight } from 'react-icons/fi';
import { UploadThumbnail } from './upload-thumbnail';
import { getDocsUrl } from '~/utils/constants';
import { NewFeature } from '~/atoms/new-badge';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  live?: LivePrivate;
  tenantId: number;
  onSubmitted?: (
    live?: LivePublic,
    preferMoveTo?: 'broadcast-via-browser'
  ) => void;
  isCreate?: boolean;
  allowUnstable?: boolean;
};

const guidelineDocs =
  'https://nzws.notion.site/knzk-live-cbc2512a7ced4c80b93536d5ab671d13';

const livePermissionDocs = getDocsUrl('help/live-privacy-setting');
const liveRecordingDocs = getDocsUrl('help/live-recording');

export const LiveInfoModal: FC<Props> = ({
  isOpen,
  onClose,
  live,
  tenantId,
  onSubmitted,
  isCreate,
  allowUnstable
}) => {
  const { token } = useAuth();
  const intl = useIntl();
  const [title, setTitle] = useState(live?.title);
  const [description, setDescription] = useState(live?.description || '');
  const [privacy, setPrivacy] = useState<string>(live?.privacy || 'Public');
  const [isRequiredFollowing, setIsRequiredFollowing] = useState(
    live?.config.isRequiredFollowing ?? false
  );
  const [isRequiredFollower, setIsRequiredFollower] = useState(
    live?.config.isRequiredFollower ?? false
  );
  const [hashTag, setHashTag] = useState(live?.hashtag || '');
  const [sensitive, setSensitive] = useState(live?.sensitive || false);
  const [isRecording, setIsRecording] = useState(live?.isRecording ?? false);
  const [preferThumbnailType, setPreferThumbnailType] = useState(
    live?.config?.preferThumbnailType || 'generate'
  );
  const [customThumbnail, setCustomThumbnail] = useState<
    ImagePublic | undefined
  >(
    live?.config?.preferThumbnailType === 'custom' ? live?.thumbnail : undefined
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const handleSubmit = useCallback(
    async (preferMoveTo?: 'broadcast-via-browser') => {
      if (!title || !privacy || !token) {
        return;
      }
      setIsLoading(true);

      try {
        if (isCreate) {
          if (!tenantId) {
            throw new Error('tenantId is not found');
          }

          const {
            body: { live }
          } = await client.v1.streams.post({
            body: {
              title,
              privacy: privacy as LivePrivate['privacy'],
              hashtag: hashTag,
              sensitive,
              tenantId,
              isRecording,
              config: {
                preferThumbnailType,
                isRequiredFollowing,
                isRequiredFollower
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
          onSubmitted && onSubmitted(live, preferMoveTo);
        } else {
          if (!live?.id) {
            throw new Error('live id is not found');
          }

          await client.v1.streams._liveId(live?.id).patch({
            body: {
              title,
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
        }
      } catch (e) {
        console.warn(e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    },
    [
      tenantId,
      isCreate,
      title,
      privacy,
      token,
      live?.id,
      onClose,
      onSubmitted,
      sensitive,
      description,
      customThumbnail?.id,
      preferThumbnailType,
      hashTag,
      isRequiredFollowing,
      isRequiredFollower,
      isRecording
    ]
  );

  useEffect(() => {
    if (!live?.privacy) {
      return;
    }

    setTitle(live.title);
    setDescription(live.description || '');
    setPrivacy(live.privacy || 'Public');
    setSensitive(live.sensitive || false);
    setPreferThumbnailType(live.config.preferThumbnailType || 'generate');
    setCustomThumbnail(
      live.config.preferThumbnailType === 'custom' ? live.thumbnail : undefined
    );
    setHashTag(live.hashtag || '');
    setIsRequiredFollowing(live.config.isRequiredFollowing ?? false);
    setIsRequiredFollower(live.config.isRequiredFollower ?? false);
    setIsRecording(live.isRecording ?? true);
  }, [
    live?.title,
    live?.description,
    live?.privacy,
    live?.sensitive,
    live?.config,
    live?.thumbnail,
    live?.hashtag,
    live?.config.isRequiredFollowing,
    live?.config.isRequiredFollower,
    live?.isRecording
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
        <ModalHeader>配信を{isCreate ? '作成' : '編集'}</ModalHeader>
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

            {isCreate && (
              <Fragment>
                <FormControl isRequired>
                  <FormLabel as="legend">
                    <FormattedMessage id="create-live.privacy" />
                  </FormLabel>

                  <RadioGroup
                    value={privacy}
                    onChange={value => setPrivacy(value)}
                  >
                    <Stack spacing={4}>
                      <Radio value="Public">
                        <FormattedMessage id="create-live.privacy.public" />
                      </Radio>

                      <Radio value="Private">
                        <FormattedMessage id="create-live.privacy.private" />
                        <NewFeature />
                      </Radio>
                    </Stack>
                  </RadioGroup>

                  <FormHelperText>
                    <FormattedMessage id="create-live.privacy.private.note" />
                  </FormHelperText>
                </FormControl>

                <Collapse in={privacy === 'Private'} animateOpacity>
                  <Link
                    href={livePermissionDocs}
                    isExternal
                    fontWeight="normal"
                    fontSize="sm"
                  >
                    配信の視聴制御について <ExternalLinkIcon mx="2px" />
                  </Link>

                  <Stack spacing={4}>
                    {/** tip: following/follower は relation API を叩く視聴者視点なので、
                     * following=視聴者が配信者をフォロー、follower=配信者が視聴者をフォロー */}
                    <Checkbox
                      isChecked={isRequiredFollowing}
                      onChange={e => setIsRequiredFollowing(e.target.checked)}
                    >
                      <FormattedMessage id="create-live.privacy.private.require-following" />
                    </Checkbox>

                    <Checkbox
                      isChecked={isRequiredFollower}
                      onChange={e => setIsRequiredFollower(e.target.checked)}
                    >
                      <FormattedMessage id="create-live.privacy.private.require-follower" />
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

                {allowUnstable && (
                  <FormControl>
                    <Checkbox
                      isChecked={isRecording}
                      onChange={e => setIsRecording(e.target.checked)}
                    >
                      配信を録画する (最長約1時間)
                      <NewFeature />
                    </Checkbox>

                    <FormHelperText>
                      1時間以上配信をすると録画は途中でカットされます。
                      <Link
                        href={liveRecordingDocs}
                        isExternal
                        fontWeight="normal"
                        fontSize="sm"
                        ml={1}
                      >
                        録画について <ExternalLinkIcon mx="2px" />
                      </Link>
                    </FormHelperText>
                  </FormControl>
                )}
              </Fragment>
            )}

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
                デフォルトではプッシュ開始時、自動的にキャプチャされます。
              </FormHelperText>
            </FormControl>

            <Collapse in={preferThumbnailType === 'custom'} animateOpacity>
              <UploadThumbnail
                thumbnailUrl={customThumbnail?.publicUrl}
                onThumbnailChange={setCustomThumbnail}
                onUploading={setIsLoading}
                tenantId={tenantId}
              />
            </Collapse>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Stack spacing={2} width="100%">
            {isCreate && (
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
            )}

            <Button
              colorScheme="blue"
              onClick={() => void handleSubmit()}
              width="100%"
              isLoading={isLoading}
            >
              {isCreate ? '配信枠を作成' : '編集'}
            </Button>

            {isCreate && (
              <Button
                colorScheme="blue"
                variant="ghost"
                onClick={() => void handleSubmit('broadcast-via-browser')}
                width="100%"
                isLoading={isLoading}
                rightIcon={<FiArrowRight />}
              >
                ブラウザですぐに配信
              </Button>
            )}
          </Stack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
