import { FC, PropsWithChildren } from 'react';
import { TenantPublic } from '~/../server/src/models/tenant';
import { AuthContext, useAuthInProvider } from '~/utils/contexts/auth';

type Props = {
  tenant?: TenantPublic;
};

export const APIProvider: FC<PropsWithChildren<Props>> = ({
  tenant,
  children
}) => {
  const api = useAuthInProvider(tenant?.id);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
};
