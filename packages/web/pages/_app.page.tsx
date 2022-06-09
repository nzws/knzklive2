import type { AppProps } from 'next/app';
import Head from 'next/head';
import { NextUIProvider } from '@nextui-org/react';
import useSWR, { SWRConfig } from 'swr';
import { fetcher, withQuery } from 'utils/fetcher';
import type {
  Params as TenantParams,
  Response as TenantResponse
} from '@server/controllers/v1/tenant';

const swrConfig = {
  fetcher
};

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
  const { data } = useSWR<TenantResponse>(
    withQuery<TenantParams>('/v1/tenant', {
      tenantDomain: location.host
    }),
    fetcher
  );

  return (
    <NextUIProvider>
      <SWRConfig value={swrConfig}>
        <Head>
          <title>{data?.displayName || 'KnzkLive'}</title>
        </Head>

        <Component {...pageProps} />
      </SWRConfig>
    </NextUIProvider>
  );
};

export default App;
