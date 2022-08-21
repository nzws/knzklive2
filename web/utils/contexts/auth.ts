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
    TOKEN_LS
  );
  const [mastodonToken, setMastodonToken, removeMastodonToken] =
    useLocalStorage<string | undefined>(MASTODON_LS);
  const [requiredRefresh, setRequiredRefresh] = useState(false);

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
      } else {
        throw new Error('type is invalid');
      }
    },
    [tenantId]
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
            token: mastodonToken
          }
        });
      }
    } catch (e) {
      console.warn(e);
    }

    removeToken();
    removeMastodonToken();
  }, [removeToken, removeMastodonToken, mastodonToken]);

  const refresh = useCallback(async () => {
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
        return;
      }
    } catch (e) {
      console.warn(e);
    }

    await signOut();
  }, [signOut, mastodonToken, setToken]);

  useEffect(() => {
    if (requiredRefresh) {
      void refresh();
    }
  }, [requiredRefresh, refresh]);

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
