import { FC, useCallback, useEffect, useState } from 'react';
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
  AlertIcon
} from '@chakra-ui/react';
import { LivePublic } from 'api-types/common/types';
import { client } from '~/utils/api/client';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { useAuth } from '~/utils/hooks/use-auth';
import { FormattedMessage } from 'react-intl';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  live: LivePublic;
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
  const [title, setTitle] = useState(live.title);
  const [description, setDescription] = useState(live.description || '');
  const [privacy, setPrivacy] = useState<string>(live.privacy || 'Public');
  const [sensitive, setSensitive] = useState(live.sensitive || false);
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
        await client.v1.streams._liveId(live.id).patch({
          body: {
            title,
            privacy: privacy as LivePublic['privacy'],
            sensitive,
            description
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
    description
  ]);

  useEffect(() => {
    setTitle(live.title);
    setDescription(live.description || '');
    setPrivacy(live.privacy || 'Public');
    setSensitive(live.sensitive || false);
  }, [live.title, live.description, live.privacy, live.sensitive]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
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
