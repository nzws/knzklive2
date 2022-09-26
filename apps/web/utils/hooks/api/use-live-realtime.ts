import { CommentPublic, LivePublic } from 'api-types/common/types';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { client, wsURL } from '~/utils/api/client';
import { useAuth } from '../use-auth';
import { useAPIError } from './use-api-error';
import {
  LiveUpdateCommentCreated,
  LiveUpdateCommentDeleted,
  LiveUpdateMessage
} from 'api-types/streaming/live-update';

type Payload = LiveUpdateMessage | { error?: string };

const commentReducer = (
  state: CommentPublic[],
  action:
    | CommentPublic
    | LiveUpdateCommentCreated
    | LiveUpdateCommentDeleted
    | undefined
) => {
  if (!action) {
    return [];
  }

  let comment: CommentPublic;
  if ('type' in action) {
    if (action.type === 'comment:deleted') {
      return state.filter(comment => comment.id !== action.data.id);
    }

    comment = action.data;
  } else {
    comment = action;
  }

  const data = state.concat(comment).sort((a, b) => b.id - a.id);
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

export const useLiveRealtime = (liveId?: number, viewerToken?: string) => {
  const { token, headers } = useAuth();
  const tokenRef = useRef(token);
  const socketRef = useRef<WebSocket>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const needConnectingRef = useRef(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [comments, setComment] = useReducer(commentReducer, []);
  const [live, setLive] = useState<LivePublic>();
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const disconnect = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    try {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = undefined;
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const connect = useCallback(() => {
    disconnect();
    if (!liveId || !needConnectingRef.current) {
      return;
    }

    try {
      const Token = viewerToken || tokenRef.current || '';
      const url = `${wsURL}/websocket/v1/live/${liveId}?token=${Token}`;
      const ws = new WebSocket(url);
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
            needConnectingRef.current = false;
            throw new Error(data.error);
          }

          if ('type' in data) {
            if (data.type === 'live:update') {
              setLive(data.data);
              return;
            }

            setComment(data);
          }
        } catch (e) {
          console.warn(e);
          setError(e);
        }
      };

      ws.onclose = () => {
        console.log('close');
        setIsConnecting(false);

        if (needConnectingRef.current) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => connect(), 1000);
        }
      };
    } catch (e) {
      console.warn(e);
      setError(e);
    }
  }, [liveId, viewerToken, disconnect]);

  const reconnect = useCallback(() => {
    needConnectingRef.current = true;
    connect();
  }, [connect]);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    needConnectingRef.current = true;
    connect();

    return () => {
      needConnectingRef.current = false;
      setComment(undefined);
      setLive(undefined);
      disconnect();
    };
  }, [liveId, viewerToken, connect, disconnect]);

  useEffect(() => {
    if (!liveId) {
      return;
    }

    void (async () => {
      try {
        if (viewerToken) {
          const { body } = await client.v1.lives._liveId(liveId).comments.get({
            query: {
              viewerToken
            }
          });

          body.forEach(comment => {
            setComment(comment);
          });
        } else {
          const { body } = await client.v1.lives._liveId(liveId).comments.get({
            headers
          });

          body.forEach(comment => {
            setComment(comment);
          });
        }
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [viewerToken, liveId, headers]);

  return { comments, live, isConnecting, reconnect } as const;
};
