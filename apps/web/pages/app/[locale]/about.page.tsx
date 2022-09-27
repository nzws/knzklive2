import useAspidaSWR from '@aspida/swr';
import { NextPage } from 'next';
import Head from 'next/head';
import { Fragment } from 'react';
import {
  Container,
  Divider,
  Heading,
  Link,
  ListItem,
  Stack,
  Text,
  UnorderedList
} from '@chakra-ui/react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { defaultGetStaticPaths } from '~/utils/data-fetching/default-static-paths';
import { PageProps } from '~/utils/data-fetching/get-all-static-props';
import {
  Props,
  PathProps,
  defaultStaticProps
} from '~/utils/data-fetching/default-static-props';
import { client } from '~/utils/api/client';
import { Navbar } from '~/organisms/navbar';
import { useTenant } from '~/utils/hooks/api/use-tenant';
import { Footer } from '~/organisms/footer';

const Page: NextPage<PageProps<Props, PathProps>> = ({
  props: { tenant: tenantFallback },
  pathProps: { tenantDomain }
}) => {
  const intl = useIntl();
  const [tenant] = useTenant(tenantDomain, tenantFallback);
  const { data: about } = useAspidaSWR(client.v1.about);

  return (
    <Fragment>
      <Navbar tenant={tenant} />

      <Head>
        <title>
          {[
            intl.formatMessage({ id: 'page.about.title' }),
            tenant?.displayName || tenant?.domain
          ].join(' - ')}
        </title>
      </Head>

      <Container py={6}>
        <Stack spacing={5}>
          <Heading>
            <FormattedMessage id="page.about.title" />
          </Heading>

          <Text>
            <FormattedMessage id="page.about.description.1" />
            <br />
            <FormattedMessage
              id="page.about.description.2"
              values={{ domain: tenant?.domain }}
            />
          </Text>

          <UnorderedList>
            <ListItem>
              <FormattedMessage
                id="page.about.default-domain"
                values={{ domain: about?.defaultDomain }}
              />
            </ListItem>
            <ListItem>
              <FormattedMessage
                id="page.about.contact"
                values={{ contact: about?.contact }}
              />
            </ListItem>
          </UnorderedList>

          <Divider />

          <Text>
            <FormattedMessage id="page.about.license" />
          </Text>

          <UnorderedList>
            <ListItem>
              GitHub:{' '}
              <Link href="https://github.com/nzws/knzklive2" isExternal>
                github.com/nzws/knzklive2
                <ExternalLinkIcon mx="2px" />
              </Link>
            </ListItem>
          </UnorderedList>
        </Stack>
      </Container>

      <Footer />
    </Fragment>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = defaultStaticProps;

export default Page;
