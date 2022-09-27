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

const Page: NextPage<PageProps<Props, PathProps>> = () => {
  return (
    <Fragment>
      <Navbar />

      <Head>
        <title>KnzkLive</title>
      </Head>

      <LiveNotFound />

      <Footer />
    </Fragment>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = defaultStaticProps;

export default Page;
