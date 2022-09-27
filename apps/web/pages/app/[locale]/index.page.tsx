import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Fragment, useEffect } from 'react';
import { defaultGetStaticPaths } from '~/utils/data-fetching/default-static-paths';
import { PageProps } from '~/utils/data-fetching/get-all-static-props';
import {
  Props,
  PathProps,
  defaultStaticProps
} from '~/utils/data-fetching/default-static-props';
import { Navbar } from '~/organisms/navbar';
import { useTenant } from '~/utils/hooks/api/use-tenant';
import { Footer } from '~/organisms/footer';
import { useLiveTop } from '~/utils/hooks/api/use-live-top';
import { LiveNotFound } from '~/organisms/index/live-not-found';

const Page: NextPage<PageProps<Props, PathProps>> = ({
  props: { tenant: tenantFallback },
  pathProps: { tenantDomain }
}) => {
  const router = useRouter();
  const [tenant] = useTenant(tenantDomain, tenantFallback);
  const [live] = useLiveTop(tenant?.id);

  useEffect(() => {
    if (live) {
      void router.push(`/watch/${live.idInTenant}`);
    }
  }, [router, live]);

  return (
    <Fragment>
      <Navbar tenant={tenant} />

      <Head>
        <title>{tenant?.displayName || tenant?.domain}</title>
      </Head>

      {!live && <LiveNotFound />}

      <Footer />
    </Fragment>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = defaultStaticProps;

export default Page;
