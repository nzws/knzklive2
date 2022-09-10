import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { IntlProvider } from 'react-intl';
import { APIProvider } from '../organisms/providers/api';
import {
  Props as LocaleProps,
  PathProps as LocalePathProps
} from '~/utils/data-fetching/locale';
import {
  Props as TenantProps,
  PathProps as TenantPathProps
} from '~/utils/data-fetching/tenant';

type InitialPageProps = {
  props: LocaleProps & TenantProps;
  pathProps: LocalePathProps & TenantPathProps;
};

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
  const { props, pathProps } = pageProps as InitialPageProps;

  return (
    <IntlProvider messages={props?.locales} locale={pathProps?.locale}>
      <ChakraProvider>
        <APIProvider>
          <Component {...pageProps} />
        </APIProvider>
      </ChakraProvider>
    </IntlProvider>
  );
};

export default App;
