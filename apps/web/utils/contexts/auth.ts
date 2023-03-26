import useAspidaSWR from '@aspida/swr';
import { useToast } from '@chakra-ui/react';
import { useCallback, useEffect, useState, createContext } from 'react';
import { useIntl } from 'react-intl';
import { useLocalStorage } from 'react-use';
import { UserPrivate } from 'api-types/common/types';
import { NewWindow } from '../../utils/new-window';
import { client } from '../api/client';
import { useAPIError } from '../hooks/api/use-api-error';

export enum SignInType {
  Mastodon,
  Misskey
}

export type Returns = {
  token?: string;
  mastodonToken?: string;
  misskeyToken?: string;
  signIn: (type: SignInType, domain?: string) => Promise<void>;
  signInCallback: (code: string) => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  user?: UserPrivate;
};

const TYPE_SS = 'sign-in-provider-type';
const TOKEN_LS = 'knzklive-token';
const MASTODON_LS = 'knzklive-mastodon-token';
const MISSKEY_LS = 'knzklive-misskey-token';
export const MASTODON_DOMAIN_LS = 'knzklive-mastodon-domain';
export const MISSKEY_DOMAIN_LS = 'knzklive-misskey-domain';

export const useAuthInProvider = (): Returns => {
  const intl = useIntl();
  const toast = useToast();
  const [token, setToken, removeToken] = useLocalStorage<string | undefined>(
    TOKEN_LS,
    undefined,
    {
      raw: true
    }
  );
  const [mastodonToken, setMastodonToken, removeMastodonToken] =
    useLocalStorage<string | undefined>(MASTODON_LS, undefined, {
      raw: true
    });
  const [misskeyToken, setMisskeyToken, removeMisskeyToken] = useLocalStorage<
    string | undefined
  >(MISSKEY_LS, undefined, {
    raw: true
  });
  const [requiredRefresh, setRequiredRefresh] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data: user, error } = useAspidaSWR(client.v1.users.me, {
    headers: {
      Authorization: `Bearer ${token || ''}`
    },
    key: token ? undefined : null
  });
  const [userError] = useAPIError(error);

  const handleForceUpdateToken = useCallback(() => {
    const token = localStorage.getItem(TOKEN_LS);
    setToken(token || undefined);
    setMastodonToken(localStorage.getItem(MASTODON_LS) || undefined);
    setMisskeyToken(localStorage.getItem(MISSKEY_LS) || undefined);

    return !!token;
  }, [setToken, setMastodonToken, setMisskeyToken]);

  const signIn = useCallback(
    async (type: SignInType, domain?: string) => {
      if (type === SignInType.Mastodon) {
        if (!domain) {
          throw new Error('domain is required');
        }

        localStorage.setItem(MASTODON_DOMAIN_LS, domain);
        sessionStorage.setItem(TYPE_SS, 'mastodon');

        const url = client.v1.auth.mastodon.login.$path({
          query: {
            domain
          }
        });

        const signInWindow = new NewWindow('sign-in-window', url);
        await signInWindow.waitForClose();
        const isUpdated = handleForceUpdateToken();
        if (isUpdated) {
          toast({
            title: intl.formatMessage({
              id: 'auth.toast.login'
            }),
            status: 'success',
            isClosable: true
          });
        }
      } else if (type === SignInType.Misskey) {
        if (!domain) {
          throw new Error('domain is required');
        }

        localStorage.setItem(MISSKEY_DOMAIN_LS, domain);
        sessionStorage.setItem(TYPE_SS, 'misskey');

        const url = client.v1.auth.misskey.login.$path({
          query: {
            domain
          }
        });

        const signInWindow = new NewWindow('sign-in-window', url);
        await signInWindow.waitForClose();
        const isUpdated = handleForceUpdateToken();
        if (isUpdated) {
          toast({
            title: intl.formatMessage({
              id: 'auth.toast.login'
            }),
            status: 'success',
            isClosable: true
          });
        }
      } else {
        throw new Error('type is invalid');
      }
    },
    [handleForceUpdateToken, toast, intl]
  );

  const signInCallback = useCallback(
    async (code: string) => {
      const type = sessionStorage.getItem(TYPE_SS);
      if (type === 'mastodon') {
        const domain = localStorage.getItem(MASTODON_DOMAIN_LS);
        if (!domain) {
          throw new Error('domain is required');
        }

        const data = await client.v1.auth.mastodon.token.$post({
          body: {
            code,
            domain
          }
        });
        if (!data) {
          throw new Error('failed to get');
        }

        setToken(data.liveToken);
        setMastodonToken(data.mastodonToken);
        setRequiredRefresh(false);
      } else if (type === 'misskey') {
        const domain = localStorage.getItem(MISSKEY_DOMAIN_LS);
        if (!domain) {
          throw new Error('domain is required');
        }

        const data = await client.v1.auth.misskey.token.$post({
          body: {
            session: code,
            domain
          }
        });
        if (!data) {
          throw new Error('failed to get');
        }

        setToken(data.liveToken);
        setMisskeyToken(data.misskeyToken);
        setRequiredRefresh(false);
      } else {
        throw new Error('type is invalid');
      }
    },
    [setMastodonToken, setToken, setMisskeyToken, setRequiredRefresh]
  );

  const signOut = useCallback(async () => {
    try {
      if (mastodonToken) {
        const domain = localStorage.getItem(MASTODON_DOMAIN_LS);
        if (!domain) {
          throw new Error('domain is required');
        }

        await client.v1.auth.mastodon.revoke.$post({
          body: {
            domain,
            mastodonToken,
            liveToken: token
          }
        });
      } else if (misskeyToken) {
        const domain = localStorage.getItem(MISSKEY_DOMAIN_LS);
        if (!domain) {
          throw new Error('domain is required');
        }

        await client.v1.auth.misskey.revoke.$post({
          body: {
            domain,
            misskeyToken,
            liveToken: token
          }
        });
      }
    } catch (e) {
      console.warn(e);
    }

    toast({
      title: intl.formatMessage({ id: 'auth.toast.logout' }),
      status: 'success',
      isClosable: true
    });

    removeToken();
    removeMastodonToken();
    removeMisskeyToken();
  }, [
    removeToken,
    removeMastodonToken,
    removeMisskeyToken,
    token,
    toast,
    intl,
    mastodonToken,
    misskeyToken
  ]);

  const refresh = useCallback(async () => {
    setToken(undefined);
    try {
      if (mastodonToken) {
        const domain = localStorage.getItem(MASTODON_DOMAIN_LS);
        if (!domain) {
          throw new Error('domain is required');
        }

        const data = await client.v1.auth.mastodon.refresh.$post({
          body: {
            domain,
            token: mastodonToken
          }
        });
        if (!data) {
          throw new Error('failed to get');
        }

        setToken(data.liveToken);
        setRequiredRefresh(false);
        handleForceUpdateToken();
        return;
      } else if (misskeyToken) {
        const domain = localStorage.getItem(MISSKEY_DOMAIN_LS);
        if (!domain) {
          throw new Error('domain is required');
        }

        const data = await client.v1.auth.misskey.refresh.$post({
          body: {
            domain,
            token: misskeyToken
          }
        });
        if (!data) {
          throw new Error('failed to get');
        }

        setToken(data.liveToken);
        setRequiredRefresh(false);
        handleForceUpdateToken();
        return;
      }
    } catch (e) {
      console.warn(e);
    }

    await signOut();
  }, [signOut, mastodonToken, setToken, handleForceUpdateToken, misskeyToken]);

  useEffect(() => {
    if (requiredRefresh) {
      void refresh();
    }
  }, [requiredRefresh, refresh]);

  useEffect(() => {
    if (userError?.errorCode === 'unauthorized') {
      setRequiredRefresh(true);
    }
  }, [userError]);

  return {
    token,
    mastodonToken,
    misskeyToken,
    signInCallback,
    signIn,
    refresh,
    signOut,
    user
  } as const;
};

export const AuthContext = createContext<Partial<Returns>>({});
