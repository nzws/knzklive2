import { TenantPublic } from 'api-types/common/types';
import { client } from '../api/client';

export type PathProps = {
  slug: string;
};

export type Props = {
  tenant?: TenantPublic;
};

export const tenantFetcher = async (pathProps: PathProps): Promise<Props> => {
  const { slug } = pathProps;

  const tenant = await client.v1.tenants.find._slugOrId(slug).$get();

  return {
    tenant
  };
};
