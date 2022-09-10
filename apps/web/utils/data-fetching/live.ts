import { LivePublic } from '~/../server/src/models/live';
import { client } from '../api/client';

export type PathProps = {
  id: string;
  tenantDomain: string;
};

export type Props = {
  live: LivePublic;
};

export const liveFetcher = async (pathProps: PathProps): Promise<Props> => {
  const { id, tenantDomain } = pathProps;

  const live = await client.v1.lives.find
    ._tenantDomain(tenantDomain)
    ._idInTenant(parseInt(id, 10))
    .$get();

  return {
    live
  };
};
