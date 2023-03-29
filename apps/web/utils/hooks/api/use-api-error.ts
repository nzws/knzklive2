import { HTTPError } from '@aspida/fetch';
import { useToast } from '@chakra-ui/react';
import { APIError } from 'api-types/common/types';
import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

const checkIsApiError = (error: unknown): error is HTTPError =>
  error instanceof HTTPError;

export const getAPIError = async (
  error?: unknown
): Promise<APIError | undefined> => {
  if (!error || !checkIsApiError(error)) {
    return undefined;
  }
  const response = error.response;

  try {
    return (await response.json()) as APIError;
  } catch (e) {
    console.warn(e);
    return undefined;
  }
};

export const useAPIError = (error?: unknown): [APIError | undefined] => {
  const intl = useIntl();
  const lastMessageRef = useRef<string>();
  const toast = useToast();
  const [apiError, setApiError] = useState<APIError>();

  useEffect(() => {
    if (!error) {
      setApiError(undefined);
      return;
    }

    void (async () => {
      const apiError = await getAPIError(error);
      if (apiError) {
        const message = apiError.errorCode
          ? intl.formatMessage({
              id: `api-error.${apiError.errorCode}`
            }) +
            '\n' +
            JSON.stringify(apiError)
          : JSON.stringify(apiError);
        if (lastMessageRef.current === message) {
          return;
        }

        toast({
          title: intl.formatMessage({ id: 'toast.api-error.title' }),
          description: message,
          status: 'error',
          isClosable: true
        });
        setApiError(apiError);
        lastMessageRef.current = message;

        return;
      } else {
        const message = error.toString();
        if (lastMessageRef.current === message) {
          return;
        }

        toast({
          title: intl.formatMessage({ id: 'toast.api-error.title' }),
          description: message,
          status: 'error',
          isClosable: true
        });
        setApiError(undefined);
        lastMessageRef.current = message;
      }
    })();
  }, [error, toast, intl]);

  return [apiError];
};
