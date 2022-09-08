import useAspidaSWR from '@aspida/swr';
import { useCallback, useEffect, useState, createContext } from 'react';
import { useLocalStorage } from 'react-use';
import { NewWindow } from '../../utils/new-window';
import { client } from '../api/client';

export enum SignInType {
  Mastodon
}

export type Returns = {
  token?: string;
  mastodonToken?: string;
  signIn: (type: SignInType, domain?: string) => Promise<void>;
  signInCallback: (code: string) => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const TYPE_SS = 'sign-in-provider-type';
const TOKEN_LS = 'knzklive-token';
const MASTODON_LS = 'knzklive-mastodon-token';
const MASTODON_DOMAIN_LS = 'knzklive-mastodon-domain';

export const useAuthInProvider = (tenantId?: number): Returns => {
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
  const [requiredRefresh, setRequiredRefresh] = useState(false);
  const { data: user } = useAspidaSWR(client.v1.users.me, {
    headers: {
      Authorization: `Bearer ${token || ''}`
    },
    key: token ? `${token}/users/me` : null
  });

  const handleForceUpdateToken = useCallback(() => {
    setToken(localStorage.getItem(TOKEN_LS) || undefined);
    setMastodonToken(localStorage.getItem(MASTODON_LS) || undefined);
  }, [setToken, setMastodonToken]);

  const signIn = useCallback(
    async (type: SignInType, domain?: string) => {
      if (!tenantId) {
        return;
      }

      if (type === SignInType.Mastodon) {
        if (!domain) {
          throw new Error('domain is required');
        }

        localStorage.setItem(MASTODON_DOMAIN_LS, domain);
        sessionStorage.setItem(TYPE_SS, 'mastodon');

        const url = client.v1.auth.mastodon.login.$path({
          query: {
            tenantId,
            domain
          }
        });

        const signInWindow = new NewWindow('sign-in-window', url);
        await signInWindow.waitForClose();
        handleForceUpdateToken();
      } else {
        throw new Error('type is invalid');
      }
    },
    [tenantId, handleForceUpdateToken]
  );

  const signInCallback = useCallback(
    async (code: string) => {
      const type = sessionStorage.getItem(TYPE_SS);
      if (type === 'mastodon') {
        const domain = localStorage.getItem(MASTODON_DOMAIN_LS);
        if (!domain) {
          throw new Error('domain is required');
        }

        try {
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
        } catch (e) {
          console.error(e);
          throw new Error('failed to get token');
        }
      } else {
        throw new Error('type is invalid');
      }
    },
    [setMastodonToken, setToken]
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
      }
    } catch (e) {
      console.warn(e);
    }

    removeToken();
    removeMastodonToken();
  }, [removeToken, removeMastodonToken, mastodonToken, token]);

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
      }
    } catch (e) {
      console.warn(e);
    }

    await signOut();
  }, [signOut, mastodonToken, setToken, handleForceUpdateToken]);

  useEffect(() => {
    if (requiredRefresh) {
      void refresh();
    }
  }, [requiredRefresh, refresh]);

  useEffect(() => {
    if (user?.errorCode === 'unauthorized') {
      setRequiredRefresh(true);
    }
  }, [user]);

  return {
    token,
    mastodonToken,
    signInCallback,
    signIn,
    refresh,
    signOut
  };
};

export const AuthContext = createContext<Partial<Returns>>({});
