import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { APIProvider } from '@web/organisms/providers/api';

const App = ({ Component, pageProps }: AppProps): JSX.Element => (
  <ChakraProvider>
    <APIProvider>
      <Component {...pageProps} />
    </APIProvider>
  </ChakraProvider>
);

export default App;
