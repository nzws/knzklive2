import { NextPage } from 'next';
import Head from 'next/head';
import { Fragment } from 'react';
import { Alert, AlertIcon, Container, Heading, Stack } from '@chakra-ui/react';
import { FormattedMessage, useIntl } from 'react-intl';
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

const Page: NextPage<PageProps<Props, PathProps>> = ({
  props: { tenant: tenantFallback },
  pathProps: { tenantDomain }
}) => {
  const intl = useIntl();
  const [tenant] = useTenant(tenantDomain, tenantFallback);

  return (
    <Fragment>
      <Navbar tenant={tenant} />

      <Head>
        <title>
          {[
            intl.formatMessage({ id: 'page.account-settings.title' }),
            tenant?.displayName || tenant?.domain
          ].join(' - ')}
        </title>
      </Head>

      <Container py={6}>
        <Stack spacing={6}>
          <Heading>
            <FormattedMessage id="page.account-settings.title" />
          </Heading>

          <Stack spacing={4}>
            <Heading size="md">
              <FormattedMessage id="page.account-settings.profile.title" />
            </Heading>

            <Alert status="info">
              <AlertIcon />
              <FormattedMessage id="page.account-settings.profile.note" />
            </Alert>
          </Stack>

          <Stack spacing={4}>
            <Heading size="md">
              <FormattedMessage id="page.account-settings.tenant.title" />
            </Heading>

            <Alert status="info">
              <AlertIcon />
              <FormattedMessage id="page.account-settings.tenant.note" />
            </Alert>
          </Stack>
        </Stack>
      </Container>

      <Footer />
    </Fragment>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = defaultStaticProps;

export default Page;
