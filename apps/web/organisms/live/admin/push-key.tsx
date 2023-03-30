import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
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
  url: string;
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

  const handleUrlFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      if (!rtmp) {
        return;
      }

      void (async () => {
        e.target.select();
        await navigator.clipboard.writeText(rtmp.url);

        toast({
          title: 'サーバーURL をコピーしました',
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
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>サーバーURL</FormLabel>

            <InputGroup size="md">
              <Input
                type="text"
                value={rtmp.url}
                onFocus={handleUrlFocus}
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
        </HStack>
      )}
    </Fragment>
  );
};
