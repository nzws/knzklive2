import { NextPage } from 'next';
import Head from 'next/head';
import { Fragment } from 'react';
import { defaultGetStaticPaths } from '~/utils/data-fetching/default-static-paths';
import {
  getAllStaticProps,
  PageProps
} from '~/utils/data-fetching/get-all-static-props';
import {
  tenantFetcher,
  Props as TenantProps,
  PathProps as TenantPathProps
} from '~/utils/data-fetching/tenant';
import {
  localeFetcher,
  Props as LocaleProps,
  PathProps as LocalePathProps
} from '~/utils/data-fetching/locale';
import {
  liveFetcher,
  Props as LiveProps,
  PathProps as LivePathProps
} from '~/utils/data-fetching/live';
import { Navbar } from '~/organisms/navbar';
import { useTenant } from '~/utils/hooks/api/use-tenant';
import { useLiveWithIdInTenant } from '~/utils/hooks/api/use-live-with-id-in-tenant';
import { Live } from '~/organisms/live';

type Props = TenantProps & LocaleProps & LiveProps;
type PathProps = TenantPathProps & LocalePathProps & LivePathProps;

const Page: NextPage<PageProps<Props, PathProps>> = ({
  props: { tenant: tenantFallback, live: liveFallback },
  pathProps: { tenantDomain, id }
}) => {
  const [tenant] = useTenant(tenantDomain, tenantFallback);
  const [live] = useLiveWithIdInTenant(tenantDomain, id, liveFallback);

  return (
    <Fragment>
      <Navbar tenant={tenant} />

      <Head>
        <title>
          {[live?.title, tenant?.displayName || tenant?.domain].join(' - ')}
        </title>
      </Head>

      {live && <Live live={live} />}
    </Fragment>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = getAllStaticProps<Props, PathProps>([
  tenantFetcher,
  localeFetcher,
  liveFetcher
]);

export default Page;
