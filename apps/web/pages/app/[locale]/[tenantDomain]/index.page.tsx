import useAspidaSWR from '@aspida/swr';
import { NextPage } from 'next';
import Head from 'next/head';
import { Fragment } from 'react';
import { defaultGetStaticPaths } from '~/utils/data-fetching/default-static-paths';
import { PageProps } from '~/utils/data-fetching/get-all-static-props';
import {
  Props,
  PathProps,
  defaultStaticProps
} from '~/utils/data-fetching/default-static-props';
import { client } from '~/utils/api/client';
import { Navbar } from '~/organisms/navbar';
import { useUsersMe } from '~/utils/hooks/api/use-users-me';

const Page: NextPage<PageProps<Props, PathProps>> = ({
  props: { tenant: tenantFallback },
  pathProps: { tenantDomain }
}) => {
  const { data: tenant } = useAspidaSWR(
    client.v1.tenants._tenantDomain(tenantDomain),
    {
      fallbackData: tenantFallback
    }
  );
  const [me] = useUsersMe();

  return (
    <Fragment>
      <Navbar />

      <Head>
        <title>{tenant?.displayName || 'KnzkLive'}</title>
      </Head>

      <pre>{JSON.stringify(tenant, null, 2)}</pre>

      <pre>{JSON.stringify(me, null, 2)}</pre>
    </Fragment>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = defaultStaticProps;

export default Page;
