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
import { Navbar } from '~/organisms/navbar';
import { useUsersMe } from '~/utils/hooks/api/use-users-me';
import { useTenant } from '~/utils/hooks/api/use-tenant';
import { Footer } from '~/organisms/footer';

const Page: NextPage<PageProps<Props, PathProps>> = ({
  props: { tenant: tenantFallback },
  pathProps: { tenantDomain }
}) => {
  const [tenant] = useTenant(tenantDomain, tenantFallback);
  const [me] = useUsersMe();

  return (
    <Fragment>
      <Navbar tenant={tenant} />

      <Head>
        <title>{tenant?.displayName || tenant?.domain}</title>
      </Head>

      <pre>{JSON.stringify(tenant, null, 2)}</pre>

      <pre>{JSON.stringify(me, null, 2)}</pre>

      <Footer />
    </Fragment>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = defaultStaticProps;

export default Page;
