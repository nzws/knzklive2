import useAspidaSWR from '@aspida/swr';
import { useRouter } from 'next/router';
import { FC, PropsWithChildren } from 'react';
import { client } from '@web/utils/api/client';
import { AuthContext, useAuthInProvider } from '@web/utils/contexts/auth';

export const APIProvider: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const { query } = useRouter();
  const { data: tenant } = useAspidaSWR(
    client.v1.tenants._tenantDomain(query?.tenantDomain as string)
  );
  const api = useAuthInProvider(tenant?.id);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
};
