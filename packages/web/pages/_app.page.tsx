import type { AppProps } from 'next/app';
import { NextUIProvider } from '@nextui-org/react';
import { SWRConfig } from 'swr';
import { fetcher } from 'utils/fetcher';

const swrConfig = {
  fetcher
};

const App = ({ Component, pageProps }: AppProps): JSX.Element => (
  <NextUIProvider>
    <SWRConfig value={swrConfig}>
      <Component {...pageProps} />
    </SWRConfig>
  </NextUIProvider>
);

export default App;
