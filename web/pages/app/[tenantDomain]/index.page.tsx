import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { Fragment, useCallback } from 'react';
import useSWR from 'swr';
import {
  getV1TenantsOnce,
  Response as TenantResponse
} from 'utils/api/v1/tenants/get-once';
import { getV1UsersMe } from 'utils/api/v1/users/me';
import { fetcher, SignInType } from 'utils/contexts/api';
import { useAuth } from 'utils/hooks/use-auth';

type Props = {
  tenant?: TenantResponse;
  tenantDomain: string;
};

type PathProps = {
  tenantDomain: string;
};

const Page: NextPage<Props> = ({ tenant: tenantFallback, tenantDomain }) => {
  const { signIn } = useAuth();
  const { data: tenant } = useSWR(getV1TenantsOnce([tenantDomain]), {
    fallbackData: tenantFallback
  });

  const { data: user, mutate } = useSWR('me', getV1UsersMe);

  const handleLogin = useCallback(() => {
    void (async () => {
      if (!signIn) {
        return;
      }

      const domain = prompt('Enter your domain:');
      if (!domain) {
        return;
      }

      await signIn(SignInType.Mastodon, domain);

      await mutate();
    })();
  }, [signIn, mutate]);

  return (
    <Fragment>
      <Head>
        <title>{tenant?.displayName || 'KnzkLive'}</title>
      </Head>

      <button onClick={handleLogin}>Login test</button>

      <pre>{JSON.stringify(tenant, null, 2)}</pre>

      <pre>{JSON.stringify(user, null, 2)}</pre>
    </Fragment>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  };
};

export const getStaticProps: GetStaticProps<Props, PathProps> = async ({
  params
}) => {
  const tenantDomain = params?.tenantDomain || '';

  const tenant = await fetcher(getV1TenantsOnce([tenantDomain]));
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
    revalidate: 60
  };
};

export default Page;
