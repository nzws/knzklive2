import { Box, VStack } from '@chakra-ui/react';
import { FC, useCallback, useEffect, useReducer, useRef } from 'react';
import { CommentPublic } from '~/../server/src/models/comment';
import { LivePublic } from '~/../server/src/models/live';
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
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isConnectingRef = useRef(false);
  const [comments, setComment] = useReducer(commentReducer, []);

  const connect = useCallback(() => {
    try {
      clearTimeout(timeoutRef.current);
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

        clearTimeout(timeoutRef.current);
        if (isConnectingRef.current) {
          timeoutRef.current = setTimeout(connect, 1000);
        }
      };
    } catch (e) {
      console.warn(e);

      clearTimeout(timeoutRef.current);
      if (isConnectingRef.current) {
        timeoutRef.current = setTimeout(connect, 1000);
      }
    }
  }, [live.id, token]);

  useEffect(() => {
    try {
      isConnectingRef.current = true;

      if (!live.endedAt) {
        connect();
      }

      void client.v1.lives
        ._liveId(live.id)
        .comments.$get({
          headers
        })
        .then(data => data.forEach(setComment));
    } catch (e) {
      console.warn(e);
    }

    return () => {
      isConnectingRef.current = false;
      try {
        socketRef.current?.close();
      } catch (e) {
        console.warn(e);
      }
      clearTimeout(timeoutRef.current);
      setComment(undefined);
    };
  }, [connect, live.id, live.endedAt, headers]);

  return (
    <Box w="100%" h="100%" overflowY="auto">
      <VStack spacing={4} p={4} align="stretch" width="100%">
        {comments.map(comment => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </VStack>
    </Box>
  );
};
