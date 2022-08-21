import { useContext } from 'react';
import {
  AuthContext,
  Returns as useAPIReturns
} from '@web/utils/contexts/auth';

type Returns = Partial<Omit<useAPIReturns, 'fetcher'>>;

export const useAuth = (): Returns => {
  const { token, mastodonToken, signInCallback, signIn, refresh, signOut } =
    useContext(AuthContext);

  return {
    token,
    mastodonToken,
    signInCallback,
    signIn,
    refresh,
    signOut
  };
};
