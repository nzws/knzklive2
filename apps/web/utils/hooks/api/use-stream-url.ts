import { useCallback, useEffect, useRef, useState } from 'react';
import { client } from '~/utils/api/client';
import { useAuth } from '../use-auth';
import { getAPIError, useAPIError } from './use-api-error';

export const useStreamUrl = (liveId?: number) => {
  const { token } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [url, setUrl] = useState<string | undefined>();
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const update = useCallback(async () => {
    try {
      if (!liveId) {
        setUrl(undefined);
        return;
      }

      const { body } = await client.v1.lives._liveId(liveId).url.get({
        headers: token
          ? {
              Authorization: `Bearer ${token}`
            }
          : undefined
      });

      setUrl(body.wsFlv);

      return body.wsFlv;
    } catch (e) {
      const err = await getAPIError(e);
      if (err?.errorCode === 'forbidden_live') {
        setUrl(undefined);
      } else {
        setError(e);
      }
    }
  }, [token, liveId]);

  useEffect(() => {
    if (url || !liveId) {
      return;
    }

    const updateLoop = () => {
      void (async () => {
        clearTimeout(timeoutRef.current);
        if (url || !liveId) {
          return;
        }

        const hasUrl = await update();
        if (!hasUrl) {
          timeoutRef.current = setTimeout(updateLoop, 5000);
        }
      })();
    };

    updateLoop();

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [url, liveId, update]);

  return [url, update] as const;
};
