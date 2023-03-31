import { useCallback, useEffect, useRef, useState } from 'react';
import { ToastId, useToast } from '@chakra-ui/react';
import { useIntl } from 'react-intl';
import { LiveInitializePublicProps } from 'api-types/api/v1/lives/find/_slug@string/_idInTenant@number';
import { client } from '~/utils/api/client';
import { useAuth } from '../use-auth';
import { useAPIError } from './use-api-error';

export const useLivePermissionCheck = (
  liveId: number | undefined,
  initializeData: Partial<Omit<LiveInitializePublicProps, 'id' | 'live'>>
) => {
  const toast = useToast();
  const intl = useIntl();
  const toastIdRef = useRef<ToastId>();
  const { headers, misskeyToken, mastodonToken } = useAuth();
  const [allow, setAllow] = useState(initializeData.isAccessible);
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const handleRelationCheck = useCallback(async () => {
    if (!liveId) {
      return false;
    }

    try {
      const { body } = await client.v1.lives
        ._liveId(liveId)
        .check_relation.post({
          body: {
            mastodonToken,
            misskeyToken
          },
          headers
        });

      return body.success;
    } catch (e) {
      setError(e);
    }
  }, [headers, liveId, mastodonToken, misskeyToken]);

  const check = useCallback(async () => {
    try {
      const isRelation = await handleRelationCheck();

      if (isRelation) {
        setAllow(true);
        if (toastIdRef.current) {
          toast.close(toastIdRef.current);
          toastIdRef.current = undefined;
        }
        return;
      }
    } catch (e) {
      setError(e);
    }

    if (!toastIdRef.current) {
      toastIdRef.current = toast({
        title: intl.formatMessage({ id: 'toast.api-error.title' }),
        description: intl.formatMessage({ id: 'api-error.forbidden_live' }),
        status: 'error',
        duration: null,
        isClosable: true
      });
    }
  }, [handleRelationCheck, intl, toast]);

  useEffect(() => {
    if (allow) {
      return;
    }

    void check();
    const interval = setInterval(() => void check(), 1000 * 10);

    return () => {
      clearInterval(interval);
    };
  }, [allow, check]);

  return allow;
};
