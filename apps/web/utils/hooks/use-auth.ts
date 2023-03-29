import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../utils/contexts/auth';

export const useAuth = () => {
  const {
    token,
    mastodonToken,
    misskeyToken,
    signInCallback,
    signIn,
    refresh,
    signOut,
    user
  } = useContext(AuthContext);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const headers = useMemo(
    () =>
      token
        ? {
            Authorization: `Bearer ${token}`
          }
        : undefined,
    [token]
  );

  useEffect(() => {
    setIsSignedIn(!!token);
  }, [token]);

  return {
    isSignedIn,
    token,
    mastodonToken,
    misskeyToken,
    signInCallback,
    signIn,
    refresh,
    signOut,
    headers,
    user
  };
};
