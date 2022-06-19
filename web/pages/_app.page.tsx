import type { AppProps } from 'next/app';
import { NextUIProvider } from '@nextui-org/react';
import { SWRConfig } from 'swr';
import { APIProvider } from 'organisms/providers/api';
import { fetcher } from 'utils/contexts/api';

const swrConfig = {
  fetcher
};

const App = ({ Component, pageProps }: AppProps): JSX.Element => (
  <NextUIProvider>
    <SWRConfig value={swrConfig}>
      <APIProvider>
        <Component {...pageProps} />
      </APIProvider>
    </SWRConfig>
  </NextUIProvider>
);

export default App;
