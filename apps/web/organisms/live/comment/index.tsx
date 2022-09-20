import { Box, Flex, Heading, VStack } from '@chakra-ui/react';
import {
  FC,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react';
import { FormattedMessage } from 'react-intl';
import { LivePublic, CommentPublic } from 'api-types/common/types';
import { client, wsURL } from '~/utils/api/client';
import { useAuth } from '~/utils/hooks/use-auth';
import { Comment } from './comment';

type Props = {
  live: LivePublic;
};

type Payload =
  | CommentPublic
  | {
      id: number;
      isDeleted: boolean;
    };

const commentReducer = (
  state: CommentPublic[],
  action: Payload | undefined
) => {
  if (!action) {
    return [];
  }
  if (action.isDeleted === true) {
    return state.filter(comment => comment.id !== action.id);
  }

  const data = state
    .concat(action as CommentPublic)
    .sort((a, b) => b.id - a.id);
  data.splice(100);

  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(data[i]);
    } else if (data[i - 1].id !== data[i].id) {
      result.push(data[i]);
    }
  }

  return result;
};

export const Comments: FC<Props> = ({ live }) => {
  const { token, headers } = useAuth();
  const socketRef = useRef<WebSocket>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [comments, setComment] = useReducer(commentReducer, []);

  const connect = useCallback(() => {
    try {
      if (socketRef.current) {
        socketRef.current.close();
      }
    } catch (e) {
      console.warn(e);
    }

    try {
      const ws = new WebSocket(
        `${wsURL}/websocket/v1/stream/${live.id}?token=${token || ''}`
      );
      socketRef.current = ws;
      setIsConnecting(true);

      ws.onopen = () => {
        console.log('open');
      };

      ws.onmessage = e => {
        if (!e.data) {
          return;
        }

        try {
          const data = JSON.parse(e.data as string) as Payload;
          setComment(data);
        } catch (e) {
          console.warn(e);
        }
      };

      ws.onclose = () => {
        console.log('close');
        setIsConnecting(false);
      };
    } catch (e) {
      console.warn(e);
    }
  }, [live.id, token]);

  useEffect(() => {
    if (isConnecting) {
      return;
    }

    try {
      if (!live.endedAt) {
        connect();
      }

      void client.v1.lives
        ._liveId(live.id)
        .comments.$get({
          headers
        })
        .then(data => {
          setComment(undefined);
          data.forEach(comment => {
            setComment(comment);
          });
        });
    } catch (e) {
      console.warn(e);
    }

    return () => {
      setComment(undefined);
    };
  }, [connect, isConnecting, live.id, live.endedAt, headers]);

  return (
    <Flex flexDirection="column" height={{ base: '700px', lg: '100%' }}>
      <Box p={4}>
        <Heading size="sm">
          <FormattedMessage
            id={
              live.hashtag
                ? 'live.comment.title.with-hashtag'
                : 'live.comment.title'
            }
            values={{ hashtag: live.hashtag }}
          />
        </Heading>
      </Box>

      <Box overflowY="auto">
        <VStack spacing={2} p={2} align="stretch">
          {comments.map(comment => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </VStack>
      </Box>
    </Flex>
  );
};
