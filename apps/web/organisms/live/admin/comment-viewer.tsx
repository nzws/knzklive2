import {
  Button,
  FormControl,
  FormLabel,
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

export const CommentViewer: FC<Props> = ({ liveId }) => {
  const { token } = useAuth();
  const toast = useToast();
  const [url, setUrl] = useState('');
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
          body: { url }
        } = await client.v1.streams._liveId(liveId).comment_viewer_url.get({
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUrl(url);
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
      if (!url) {
        return;
      }

      void (async () => {
        e.target.select();
        await navigator.clipboard.writeText(url);

        toast({
          title: 'コメントビューワー URL をコピーしました',
          status: 'success',
          isClosable: true
        });
      })();
    },
    [url, toast]
  );

  return (
    <Fragment>
      {!url && (
        <Button onClick={handleGet} isLoading={isLoading}>
          コメントビューワー URL を取得
        </Button>
      )}
      {url && (
        <FormControl>
          <FormLabel>コメントビューワー URL</FormLabel>

          <InputGroup size="md">
            <Input type="text" value={url} onFocus={handleUrlFocus} readOnly />
          </InputGroup>
        </FormControl>
      )}
    </Fragment>
  );
};
