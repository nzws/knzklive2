import useAspidaSWR from '@aspida/swr';
import { NextPage } from 'next';
import Head from 'next/head';
import { Fragment, useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { defaultGetStaticPaths } from '~/utils/data-fetching/default-static-paths';
import { PageProps } from '~/utils/data-fetching/get-all-static-props';
import {
  Props,
  PathProps,
  defaultStaticProps
} from '~/utils/data-fetching/default-static-props';
import { client } from '~/utils/api/client';
import { SignInType } from '~/utils/contexts/auth';
import { useAuth } from '~/utils/hooks/use-auth';
import { Navbar } from '~/organisms/navbar';

const Page: NextPage<PageProps<Props, PathProps>> = ({
  props: { tenant: tenantFallback },
  pathProps: { tenantDomain }
}) => {
  const intl = useIntl();
  const { signIn, token, signOut } = useAuth();
  const { data: tenant } = useAspidaSWR(
    client.v1.tenants._tenantDomain(tenantDomain),
    {
      fallbackData: tenantFallback
    }
  );

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

      const domain = prompt(intl.formatMessage({ id: 'login.enter-domain' }));
      if (!domain) {
        return;
      }

      await signIn(SignInType.Mastodon, domain);

      await mutate();
    })();
  }, [signIn, mutate, intl]);

  return (
    <Fragment>
      <Navbar />

      <Head>
        <title>{tenant?.displayName || 'KnzkLive'}</title>
      </Head>

      <button onClick={handleLogin}>
        <FormattedMessage id="navbar.login" />
      </button>

      {user && (
        <button onClick={signOut}>
          <FormattedMessage id="navbar.logout" />
        </button>
      )}

      <pre>{JSON.stringify(tenant, null, 2)}</pre>

      <pre>{JSON.stringify(user, null, 2)}</pre>
    </Fragment>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = defaultStaticProps;

export default Page;
