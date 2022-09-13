import {
  Button,
  Icon,
  Input,
  InputGroup,
  InputRightElement
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
  const { token, isSignedIn } = useAuth();
  const intl = useIntl();
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  useAPIError(error);

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
        <Input
          pr="3.5rem"
          type="text"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder={intl.formatMessage(
            {
              id: !isSignedIn
                ? hashtag
                  ? 'live.comment-post.require-login.with-hashtag'
                  : 'live.comment-post.require-login'
                : hashtag
                ? 'live.comment-post.placeholder.with-hashtag'
                : 'live.comment-post.placeholder'
            },
            { hashtag }
          )}
          isDisabled={!isSignedIn}
          maxLength={100}
        />

        <InputRightElement width="3.5rem">
          <Button
            h="1.75rem"
            size="sm"
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            isDisabled={!isSignedIn}
          >
            <Icon as={FiSend} />
          </Button>
        </InputRightElement>
      </InputGroup>
    </form>
  );
};
