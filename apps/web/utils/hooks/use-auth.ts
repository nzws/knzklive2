import { useContext, useMemo } from 'react';
import { AuthContext } from '../../utils/contexts/auth';

export const useAuth = () => {
  const {
    token,
    mastodonToken,
    signInCallback,
    signIn,
    refresh,
    signOut,
    user
  } = useContext(AuthContext);
  const headers = useMemo(
    () =>
      token
        ? {
            Authorization: `Bearer ${token}`
          }
        : undefined,
    [token]
  );

  return {
    token,
    mastodonToken,
    signInCallback,
    signIn,
    refresh,
    signOut,
    headers,
    user
  };
};
