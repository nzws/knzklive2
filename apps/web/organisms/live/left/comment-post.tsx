import {
  Button,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Tooltip
} from '@chakra-ui/react';
import { FC, FormEvent, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { FiSend } from 'react-icons/fi';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { client } from '~/utils/api/client';
import { useAuth } from '~/utils/hooks/use-auth';

type Props = {
  liveId: number;
  hashtag?: string;
};

export const CommentPost: FC<Props> = ({ liveId, hashtag }) => {
  const { token } = useAuth();
  const intl = useIntl();
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const requiredLoginMessage = intl.formatMessage(
    {
      id: hashtag
        ? 'live.comment-post.require-login.with-hashtag'
        : 'live.comment-post.require-login'
    },
    { hashtag }
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!comment || !liveId || !token) {
        return;
      }
      setIsLoading(true);

      void (async () => {
        try {
          await client.v1.lives._liveId(liveId).comments.post({
            body: {
              content: comment
            },
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          setComment('');
        } catch (e) {
          console.warn(e);
          setError(e);
        } finally {
          setIsLoading(false);
        }
      })();
    },
    [comment, liveId, token]
  );

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup>
        <Tooltip hasArrow label={!token ? requiredLoginMessage : undefined}>
          <Input
            pr="4.5rem"
            type="text"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={intl.formatMessage(
              {
                id: hashtag
                  ? 'live.comment-post.placeholder.with-hashtag'
                  : 'live.comment-post.placeholder'
              },
              { hashtag }
            )}
            isDisabled={!token}
          />
        </Tooltip>

        <InputRightElement width="4.5rem">
          <Button
            h="1.75rem"
            size="sm"
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
          >
            <Icon as={FiSend} />
          </Button>
        </InputRightElement>
      </InputGroup>
    </form>
  );
};
