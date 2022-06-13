import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { Fragment } from 'react';
import useSWR from 'swr';
import { getV1Tenant, Response as TenantResponse } from 'utils/api/v1/tenant';

type Props = {
  tenant?: TenantResponse;
};

type PathProps = {
  tenantDomain: string;
};

const Page: NextPage<Props> = ({ tenant: tenantFallback }) => {
  const { data: tenant } = useSWR(
    {
      tenantDomain: location?.host
    },
    getV1Tenant,
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
  return {
    props: {
      tenant: await getV1Tenant({
        tenantDomain: params?.tenantDomain
      })
    },
    revalidate: 60,
    fallback: 'blocking'
  };
};

export default Page;
