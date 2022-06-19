import { useContext } from 'react';
import { APIContext, Returns as useAPIReturns } from 'utils/contexts/api';

type Returns = Partial<Omit<useAPIReturns, 'fetcher'>>;

export const useAuth = (): Returns => {
  const { token, mastodonToken, signInCallback, signIn, refresh, signOut } =
    useContext(APIContext);

  return {
    token,
    mastodonToken,
    signInCallback,
    signIn,
    refresh,
    signOut
  };
};
