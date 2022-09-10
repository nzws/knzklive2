import { TenantPublic } from 'server/src/models/tenant';
import { client } from '../api/client';

export type PathProps = {
  tenantDomain: string;
};

export type Props = {
  tenant: TenantPublic;
};

export const tenantFetcher = async (pathProps: PathProps): Promise<Props> => {
  const { tenantDomain } = pathProps;

  const tenant = await client.v1.tenants._tenantDomain(tenantDomain).$get();

  return {
    tenant
  };
};
