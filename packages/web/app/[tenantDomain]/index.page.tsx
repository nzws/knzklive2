import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { Fragment } from 'react';
import useSWR from 'swr';
import {
  getV1Tenant,
  path as tenantPath,
  Response as TenantResponse
} from 'utils/api/v1/tenant';
import { withQuery } from 'utils/fetcher';

type Props = {
  tenant?: TenantResponse;
};

type PathProps = {
  tenantDomain: string;
};

const Page: NextPage<Props> = ({ tenant: tenantFallback }) => {
  const { data: tenant } = useSWR(
    withQuery(tenantPath, {
      tenantDomain: location.host
    }),
    { fallbackData: tenantFallback }
  );

  return (
    <Fragment>
      <Head>
        <title>{tenant?.displayName || 'KnzkLive'}</title>
      </Head>

      <p>{tenant?.displayName}</p>
    </Fragment>
  );
};

export const getStaticProps: GetStaticProps<Props, PathProps> = async ({
  params
}) => {
  const tenantDomain = params?.tenantDomain;
  if (!tenantDomain) {
    throw new Error('Missing tenantDomain');
  }

  return {
    props: {
      tenant: await getV1Tenant({
        tenantDomain
      })
    },
    revalidate: 60,
    fallback: true
  };
};

export default Page;
