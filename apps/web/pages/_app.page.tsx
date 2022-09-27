import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ChakraProvider } from '@chakra-ui/react';
import { useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import NextNProgress from 'nextjs-progressbar';
import { APIProvider } from '../organisms/providers/api';
import {
  Props as LocaleProps,
  PathProps as LocalePathProps
} from '~/utils/data-fetching/locale';
import { defaultLocale } from '~/locales';
import { generateTheme } from '~/styles/theme';

type InitialPageProps = {
  props?: LocaleProps;
  pathProps?: LocalePathProps;
};

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
  const { props, pathProps } = pageProps as InitialPageProps;
  const theme = useMemo(() => generateTheme(), []);

  return (
    <IntlProvider
      messages={props?.locales}
      locale={pathProps?.locale || defaultLocale}
    >
      <ChakraProvider theme={theme}>
        <APIProvider>
          <NextNProgress
            options={{ showSpinner: false }}
            color="#fff"
            height={3}
          />
          <Head>
            <title>KnzkLive</title>
          </Head>

          <Component {...pageProps} />
        </APIProvider>
      </ChakraProvider>
    </IntlProvider>
  );
};

export default App;
