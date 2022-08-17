import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { SWRConfig } from 'swr';
import { APIProvider } from '~/organisms/providers/api';
import { fetcher } from '~/utils/contexts/api';

const swrConfig = {
  fetcher
};

const App = ({ Component, pageProps }: AppProps): JSX.Element => (
  <ChakraProvider>
    <SWRConfig value={swrConfig}>
      <APIProvider>
        <Component {...pageProps} />
      </APIProvider>
    </SWRConfig>
  </ChakraProvider>
);

export default App;
