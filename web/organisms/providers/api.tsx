import { useRouter } from 'next/router';
import { FC, PropsWithChildren } from 'react';
import useSWR, { SWRConfig } from 'swr';
import { getV1TenantsOnce, Response } from 'utils/api/v1/tenants/get-once';
import { APIContext } from 'utils/contexts/api';
import { useAPI } from 'utils/contexts/api';

export const APIProvider: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const { query } = useRouter();
  const { data: tenant } = useSWR<Response>(
    getV1TenantsOnce([query?.tenantDomain as string])
  );
  const api = useAPI(tenant?.id);

  return (
    <APIContext.Provider value={api}>
      <SWRConfig value={{ fetcher: api.fetcher }}>{children}</SWRConfig>
    </APIContext.Provider>
  );
};
