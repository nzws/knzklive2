import { LiveInitializePublicProps } from 'api-types/api/v1/lives/find/_slug@string/_idInTenant@number';
import { client } from '../api/client';

export type PathProps = {
  id: string;
  slug: string;
};

export type Props = LiveInitializePublicProps;

export const liveFetcher = async (pathProps: PathProps): Promise<Props> => {
  const { id, slug } = pathProps;

  const data = await client.v1.lives.find
    ._slug(slug)
    ._idInTenant(parseInt(id, 10))
    .$get();

  return data;
};
