import { CommentPublic } from 'api-types/common/types';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { client, wsURL } from '~/utils/api/client';
import { useAuth } from '../use-auth';
import { useAPIError } from './use-api-error';

type Payload =
  | CommentPublic
  | {
      id: number;
      isDeleted: boolean;
    }
  | { error?: string };

const commentReducer = (
  state: CommentPublic[],
  action: Payload | undefined
) => {
  if (!action) {
    return [];
  }
  if ('isDeleted' in action && action.isDeleted === true) {
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

export const useComments = (
  streamEnabled: boolean,
  liveId?: number,
  viewerToken?: string
) => {
  const { token, headers } = useAuth();
  const socketRef = useRef<WebSocket>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [comments, setComment] = useReducer(commentReducer, []);
  const [error, setError] = useState<unknown>();
  useAPIError(error);
  const [hasApiError, setHasApiError] = useState(false);

  const reconnect = useCallback(() => {
    setHasApiError(false);
  }, []);

  const connect = useCallback(() => {
    try {
      if (socketRef.current) {
        console.warn('socket is already connected');
        socketRef.current.close();
      }
    } catch (e) {
      console.warn(e);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!liveId) {
      return;
    }

    try {
      const ws = new WebSocket(
        `${wsURL}/websocket/v1/stream/${liveId}?token=${
          viewerToken || token || ''
        }`
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
          if ('error' in data) {
            setHasApiError(true);
            throw new Error(data.error);
          }

          setComment(data);
        } catch (e) {
          console.warn(e);
          setError(e);
        }
      };

      ws.onclose = () => {
        console.log('close');
        timeoutRef.current = setTimeout(() => setIsConnecting(false), 5000);
      };
    } catch (e) {
      console.warn(e);
      setError(e);
    }
  }, [liveId, viewerToken, token]);

  useEffect(() => {
    reconnect();
  }, [liveId, streamEnabled, viewerToken, reconnect]);

  useEffect(() => {
    if (isConnecting || !liveId || hasApiError) {
      return;
    }

    void (async () => {
      try {
        setComment(undefined);
        if (streamEnabled) {
          connect();
        }

        let comments: CommentPublic[];
        if (viewerToken) {
          const { body } = await client.v1.lives._liveId(liveId).comments.get({
            query: {
              viewerToken
            }
          });
          comments = body;
        } else {
          const { body } = await client.v1.lives._liveId(liveId).comments.get({
            headers
          });
          comments = body;
        }

        comments.forEach(comment => {
          setComment(comment);
        });
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [
    connect,
    isConnecting,
    liveId,
    streamEnabled,
    headers,
    viewerToken,
    hasApiError
  ]);

  return { comments, isConnecting, hasApiError, reconnect } as const;
};
