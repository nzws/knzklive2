import { NextPage } from 'next';
import Head from 'next/head';
import { Fragment, useState } from 'react';
import { defaultGetStaticPaths } from '~/utils/data-fetching/default-static-paths';
import {
  getAllStaticProps,
  PageProps
} from '~/utils/data-fetching/get-all-static-props';
import { Navbar } from '~/organisms/navbar';
import { Footer } from '~/organisms/footer';
import { LiveItem } from '~/organisms/live-list/live';
import {
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Spacer,
  Stack
} from '@chakra-ui/react';
import { FormattedMessage } from 'react-intl';
import {
  localeFetcher,
  Props as LocaleProps,
  PathProps as LocalePathProps
} from '~/utils/data-fetching/locale';
import {
  tenantFetcher,
  Props as TenantProps,
  PathProps as TenantPathProps
} from '~/utils/data-fetching/tenant';
import { useTenant } from '~/utils/hooks/api/use-tenant';
import { useTenantLives } from '~/utils/hooks/api/use-tenant-lives';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

type Props = LocaleProps & TenantProps;
type PathProps = LocalePathProps & TenantPathProps;

const Page: NextPage<PageProps<Props, PathProps>> = ({
  props: { tenant: tenantFallback },
  pathProps: { slug }
}) => {
  const [page, setPage] = useState(1);
  const [tenant] = useTenant(slug, tenantFallback);
  const [tenantLives, isLoadingLives] = useTenantLives(slug, page);

  return (
    <Fragment>
      <Navbar />

      <Head>
        <title>
          {[tenant?.displayName || tenant?.slug, 'KnzkLive']
            .filter(Boolean)
            .join(' - ')}
        </title>
      </Head>

      <Container maxW="container.xl" py={8}>
        <Stack spacing={12}>
          <Heading>{tenant?.displayName || tenant?.slug}</Heading>

          <Grid
            templateColumns={{
              base: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            }}
            gap={6}
          >
            {isLoadingLives && (
              <Fragment>
                <LiveItem />
                <LiveItem />
                <LiveItem />
                <LiveItem />
                <LiveItem />
                <LiveItem />
              </Fragment>
            )}

            {tenantLives?.lives.map(live => (
              <LiveItem
                live={live}
                currentWatchingCount={live.watchingCurrentCount}
                key={live.id}
              />
            ))}
          </Grid>

          <Flex>
            {page > 1 && (
              <Button
                onClick={() => setPage(page - 1)}
                leftIcon={<FiChevronLeft />}
              >
                <FormattedMessage id="common.prev-page" />
              </Button>
            )}

            <Spacer />

            {tenantLives?.hasNext && (
              <Button
                onClick={() => setPage(page + 1)}
                rightIcon={<FiChevronRight />}
              >
                <FormattedMessage id="common.next-page" />
              </Button>
            )}
          </Flex>
        </Stack>
      </Container>

      <Footer />
    </Fragment>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = getAllStaticProps<Props, PathProps>([
  localeFetcher,
  tenantFetcher
]);

export default Page;
