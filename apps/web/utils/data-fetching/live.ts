import { HTTPError } from '@aspida/fetch';
import { LivePublic } from 'api-types/common/types';
import { client } from '../api/client';

export type PathProps = {
  id: string;
  slug: string;
};

export type Props = {
  live?: LivePublic;
};

export const liveFetcher = async (pathProps: PathProps): Promise<Props> => {
  const { id, slug } = pathProps;

  try {
    const live = await client.v1.lives.find
      ._slug(slug)
      ._idInTenant(parseInt(id, 10))
      .$get();

    return {
      live
    };
  } catch (e) {
    if (e instanceof HTTPError) {
      // private live: fetch in client side
      if (e.response.status === 403) {
        return {};
      }
    }

    throw e;
  }
};
