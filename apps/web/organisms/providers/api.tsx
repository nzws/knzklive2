import { FC, PropsWithChildren } from 'react';
import { AuthContext, useAuthInProvider } from '~/utils/contexts/auth';

export const APIProvider: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const api = useAuthInProvider();

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
};
