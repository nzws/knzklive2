import useAspidaSWR from '@aspida/swr';
import { TenantPublic } from 'server/src/models/tenant';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { Fragment, useCallback, useEffect } from 'react';
import { client } from '../../../utils/api/client';
import { SignInType } from '../../../utils/contexts/auth';
import { useAuth } from '../../../utils/hooks/use-auth';

type Props = {
  tenant?: TenantPublic;
  tenantDomain: string;
};

type PathProps = {
  tenantDomain: string;
};

const Page: NextPage<Props> = ({ tenant: tenantFallback, tenantDomain }) => {
  const { signIn, token, signOut } = useAuth();
  const { data: tenant } = useAspidaSWR(
    client.v1.tenants._tenantDomain(tenantDomain),
    {
      fallbackData: tenantFallback
    }
  );
  useEffect(() => {
    console.log(token);
  }, [token]);

  const { data: user, mutate } = useAspidaSWR(client.v1.users.me, {
    headers: {
      Authorization: `Bearer ${token || ''}`
    },
    key: token ? undefined : null
  });

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

      <button onClick={handleLogin}>Login</button>

      {user && <button onClick={signOut}>Logout</button>}

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

  const { body: tenant } = await client.v1.tenants
    ._tenantDomain(tenantDomain)
    .get();
  if (!tenant || 'errorCode' in tenant) {
    throw new Error('Not found');
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
