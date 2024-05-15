import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  VStack,
  useToast
} from '@chakra-ui/react';
import { FC, FocusEvent, Fragment, useCallback, useState } from 'react';
import { client } from '~/utils/api/client';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { useAuth } from '~/utils/hooks/use-auth';

type Props = {
  liveId: number;
};

type Rtmp = {
  unsecure_url: string;
  secure_url: string | undefined;
  streamKey: string;
};

export const PushKey: FC<Props> = ({ liveId }) => {
  const { token } = useAuth();
  const toast = useToast();
  const [rtmp, setRtmp] = useState<Rtmp>();
  const [isShowKey, setIsShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const handleGet = useCallback(() => {
    void (async () => {
      if (!token) {
        return;
      }
      setIsLoading(true);

      try {
        const {
          body: { rtmp }
        } = await client.v1.streams._liveId(liveId).url.get({
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRtmp(rtmp);
      } catch (e) {
        console.warn(e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token, liveId]);

  const handleUnsecureUrlFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      if (!rtmp) {
        return;
      }

      void (async () => {
        e.target.select();
        await navigator.clipboard.writeText(rtmp.unsecure_url);

        toast({
          title: 'サーバーURL (RTMP) をコピーしました',
          status: 'success',
          isClosable: true
        });
      })();
    },
    [rtmp, toast]
  );

  const handleSecureUrlFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      if (!rtmp) {
        return;
      }

      void (async () => {
        e.target.select();
        await navigator.clipboard.writeText(rtmp.secure_url || '');

        toast({
          title: 'サーバーURL (RTMPS) をコピーしました',
          status: 'success',
          isClosable: true
        });
      })();
    },
    [rtmp, toast]
  );

  const handleKeyFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      if (!rtmp) {
        return;
      }
      setIsShowKey(true);

      void (async () => {
        e.target.select();
        await navigator.clipboard.writeText(rtmp.streamKey);

        toast({
          title: 'ストリームキー をコピーしました',
          status: 'success',
          isClosable: true
        });
      })();
    },
    [rtmp, toast]
  );

  const handleKeyBlur = useCallback(() => {
    setIsShowKey(false);
  }, []);

  return (
    <Fragment>
      {!rtmp && (
        <Button onClick={handleGet} isLoading={isLoading}>
          サーバーURLとストリームキーを表示
        </Button>
      )}
      {rtmp && (
        <VStack gap={4}>
          <FormControl>
            <FormLabel>サーバーURL (RTMPS: 推奨)</FormLabel>

            <InputGroup size="md">
              <Input
                type="text"
                value={rtmp.secure_url}
                onFocus={handleSecureUrlFocus}
                readOnly
              />
            </InputGroup>
          </FormControl>

          <FormControl>
            <FormLabel>サーバーURL (RTMP: IPv6 only)</FormLabel>

            <InputGroup size="md">
              <Input
                type="text"
                value={rtmp.unsecure_url}
                onFocus={handleUnsecureUrlFocus}
                readOnly
              />
            </InputGroup>
          </FormControl>

          <FormControl>
            <FormLabel>ストリームキー</FormLabel>
            <Input
              type={isShowKey ? 'text' : 'password'}
              value={rtmp.streamKey}
              onFocus={handleKeyFocus}
              onBlur={handleKeyBlur}
              readOnly
            />
          </FormControl>
        </VStack>
      )}
    </Fragment>
  );
};
