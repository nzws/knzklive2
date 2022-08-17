import { useCallback, useEffect, useState, createContext } from 'react';
import { useLocalStorage } from 'react-use';
import { linkV1AuthMastodonLogin } from '~/utils/api/v1/auth/mastodon/login';
import { postV1AuthMastodonRefresh } from '~/utils/api/v1/auth/mastodon/refresh';
import { postV1AuthMastodonRevoke } from '~/utils/api/v1/auth/mastodon/revoke';
import { getV1AuthMastodonToken } from '~/utils/api/v1/auth/mastodon/token';
import { RequestAsAnonymous, RequestWithToken } from '~/utils/api/v1/types';
import { NewWindow } from '~/utils/new-window';

const endpoint = process.env.NEXT_PUBLIC_SERVER_ENDPOINT || '';

export const getLink = (url: string) => endpoint + url;

export enum SignInType {
  Mastodon
}

export const withQuery = <T = Record<string, string>>(
  url: string,
  query?: T
) => {
  if (!query) {
    return url;
  }

  const queryString = Object.entries(query)
    .map(([key, value]) => `${key}=${value as string}`)
    .join('&');
  return `${url}?${queryString}`;
};

export type Returns = {
  token?: string;
  mastodonToken?: string;
  fetcher: <R>(
    req: RequestWithToken<R> | RequestAsAnonymous<R>
  ) => Promise<R | undefined>;
  signIn: (type: SignInType, domain?: string) => Promise<void>;
  signInCallback: (code: string) => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

type ErrorResponse = {
  errorCode: string;
};

type Response<T> = T | ErrorResponse | undefined;

const TYPE_SS = 'sign-in-provider-type';
const TOKEN_LS = 'knzklive-token';
const MASTODON_LS = 'knzklive-mastodon-token';
const MASTODON_DOMAIN_LS = 'knzklive-mastodon-domain';

export const fetcher = async <R>(
  req: RequestWithToken<R> | RequestAsAnonymous<R>
): Promise<Response<R> | undefined> => {
  if (!req) {
    return;
  }

  const link = getLink(withQuery(req.path, req.query));

  const response = await fetch(link, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: req.token ? `Bearer ${req.token}` : ''
    },
    ...(req.body ? { body: JSON.stringify(req.body), method: 'POST' } : {})
  });

  return response.json() as Promise<Response<R>>;
};

export const useAPI = (tenantId?: number): Returns => {
  const [token, setToken, removeToken] = useLocalStorage<string | undefined>(
    TOKEN_LS
  );
  const [mastodonToken, setMastodonToken, removeMastodonToken] =
    useLocalStorage<string | undefined>(MASTODON_LS);
  const [requiredRefresh, setRequiredRefresh] = useState(false);

  const fetcher_ = useCallback(
    async <R>(
      req: RequestWithToken<R> | RequestAsAnonymous<R>
    ): Promise<R | undefined> => {
      if (!req) {
        return;
      }

      const json = await fetcher(req);
      if (!json) {
        return;
      }

      if ('errorCode' in json) {
        if (json.errorCode === 'unauthorized') {
          setRequiredRefresh(true);
        }
        throw new Error(json.errorCode);
      }

      return json;
    },
    []
  );

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

        const url = linkV1AuthMastodonLogin({
          tenantId: tenantId.toString(),
          domain
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
          const data = await fetcher_(
            getV1AuthMastodonToken([
              {
                code,
                domain
              }
            ])
          );
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
    [setMastodonToken, setToken, fetcher_]
  );

  const signOut = useCallback(async () => {
    try {
      if (mastodonToken) {
        const domain = localStorage.getItem(MASTODON_DOMAIN_LS);
        if (!domain) {
          throw new Error('domain is required');
        }

        await fetcher_(
          postV1AuthMastodonRevoke([
            {
              domain,
              token: mastodonToken
            }
          ])
        );
      }
    } catch (e) {
      console.warn(e);
    }

    removeToken();
    removeMastodonToken();
  }, [removeToken, removeMastodonToken, fetcher_, mastodonToken]);

  const refresh = useCallback(async () => {
    try {
      if (mastodonToken) {
        const domain = localStorage.getItem(MASTODON_DOMAIN_LS);
        if (!domain) {
          throw new Error('domain is required');
        }

        const data = await fetcher_(
          postV1AuthMastodonRefresh([
            {
              token: mastodonToken,
              domain
            }
          ])
        );
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
  }, [signOut, mastodonToken, setToken, fetcher_]);

  useEffect(() => {
    if (requiredRefresh) {
      void refresh();
    }
  }, [requiredRefresh, refresh]);

  return {
    token,
    mastodonToken,
    signInCallback,
    fetcher: fetcher_,
    signIn,
    refresh,
    signOut
  };
};

type Props = Partial<Returns>;

export const APIContext = createContext<Props>({});
