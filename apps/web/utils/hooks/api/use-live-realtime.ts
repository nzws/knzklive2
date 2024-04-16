import { CommentPublic, LivePublic } from 'api-types/common/types';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { wsURL } from '~/utils/api/client';
import { useAuth } from '../use-auth';
import { useAPIError } from './use-api-error';
import {
  LiveUpdateCommentCreated,
  LiveUpdateCommentDeleted,
  LiveUpdateCommentHidden,
  LiveUpdateMessage
} from 'api-types/streaming/live-update';

type Payload = LiveUpdateMessage | { error?: string };

const commentReducer = (
  state: CommentPublic[],
  action:
    | CommentPublic
    | LiveUpdateCommentCreated
    | LiveUpdateCommentDeleted
    | LiveUpdateCommentHidden
    | undefined
) => {
  if (!action) {
    return [];
  }

  let data: CommentPublic[] = [];
  if ('type' in action) {
    if (action.type === 'comment:deleted') {
      return state.filter(comment => comment.id !== action.data.id);
    } else if (action.type === 'comment:hidden') {
      data = state.map(comment => {
        if (comment.id === action.data.id) {
          return {
            ...comment,
            isHidden: true
          };
        }

        return comment;
      });
    } else {
      data = state.concat(action.data);
    }
  } else {
    data = state.concat(action);
  }

  data.sort((a, b) => b.id - a.id);
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
  const { token } = useAuth();
  const tokenRef = useRef(token);
  const socketRef = useRef<WebSocket>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastCommentIdRef = useRef<number>(0);
  const needConnectingRef = useRef(true);
  const [comments, setComment] = useReducer(commentReducer, []);
  const [isConnecting, setIsConnecting] = useState(false);
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
      const url = `${wsURL}/websocket/v1/live/${liveId}?token=${Token}&commentAfter=${lastCommentIdRef.current}`;
      const ws = new WebSocket(url);
      socketRef.current = ws;
      setIsConnecting(true);

      ws.onopen = () => {
        console.log('open');
        setIsConnecting(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
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

      ws.onerror = e => {
        console.warn(e);
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
    disconnect();
    connect();
  }, [disconnect, connect]);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    needConnectingRef.current = true;
    connect();

    return () => {
      needConnectingRef.current = false;
      lastCommentIdRef.current = 0;
      setComment(undefined);
      setLive(undefined);
      disconnect();
    };
  }, [liveId, viewerToken, connect, disconnect]);

  useEffect(() => {
    if (comments.length > 0) {
      lastCommentIdRef.current = comments[0].id;
    }
  }, [comments]);

  return { comments, live, isConnecting, reconnect } as const;
};
