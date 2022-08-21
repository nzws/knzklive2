import useAspidaSWR from '@aspida/swr';
import { TenantPublic } from '@server/models/tenant';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { Fragment } from 'react';
import { client } from '~/utils/api/client';

type Props = {
  tenant?: TenantPublic;
  tenantDomain: string;
};

type PathProps = {
  tenantDomain: string;
};

const Page: NextPage<Props> = ({ tenant: tenantFallback, tenantDomain }) => {
  const { data: tenant } = useAspidaSWR(
    client.v1.tenants._tenantDomain(tenantDomain),
    {
      fallbackData: tenantFallback
    }
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
  const tenantDomain = params?.tenantDomain || '';
  const { body: tenant } = await client.v1.tenants
    ._tenantDomain(tenantDomain)
    .get();
  if (!tenant || 'errorCode' in tenant) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      tenant,
      tenantDomain
    },
    revalidate: 60,
    fallback: 'blocking'
  };
};

export default Page;
