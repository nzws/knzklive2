import { NextPage } from 'next';
import Head from 'next/head';
import { Fragment } from 'react';
import { defaultGetStaticPaths } from '~/utils/data-fetching/default-static-paths';
import { PageProps } from '~/utils/data-fetching/get-all-static-props';
import {
  Props,
  PathProps,
  defaultStaticProps
} from '~/utils/data-fetching/default-static-props';
import { Navbar } from '~/organisms/navbar';
import { Footer } from '~/organisms/footer';
import { LiveNotFound } from '~/organisms/index/live-not-found';
import { useExplore } from '~/utils/hooks/api/use-explore';
import { LiveItem } from '~/organisms/live-list/live';
import { Container, Grid, Heading, Stack } from '@chakra-ui/react';
import { FormattedMessage } from 'react-intl';

const Page: NextPage<PageProps<Props, PathProps>> = () => {
  const [lives, isLoadingLives] = useExplore();

  return (
    <Fragment>
      <Navbar />

      <Head>
        <title>KnzkLive</title>
      </Head>

      <Container maxW="container.xl" py={8}>
        <Stack spacing={12}>
          <Heading>
            <FormattedMessage
              id={
                lives?.length
                  ? 'page.index.title.has-live'
                  : 'page.index.title.no-live'
              }
            />
          </Heading>

          {lives && !lives.length ? (
            <LiveNotFound />
          ) : (
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
                </Fragment>
              )}

              {lives?.map(live => (
                <LiveItem
                  live={live}
                  currentWatchingCount={live.watchingCurrentCount}
                  key={live.id}
                />
              ))}
            </Grid>
          )}
        </Stack>
      </Container>

      <Footer />
    </Fragment>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = defaultStaticProps;

export default Page;
