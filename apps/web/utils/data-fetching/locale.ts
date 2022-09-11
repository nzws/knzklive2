import { SupportedLocale } from '~/locales';

export type PathProps = {
  locale: SupportedLocale;
};

export type Props = {
  locales: Record<string, string>;
};

export const localeFetcher = async (pathProps: PathProps): Promise<Props> => {
  const { locale } = pathProps;

  const locales = (
    (await import(`../../locales/${locale}.json`)) as {
      default: Record<string, string>;
    }
  ).default;

  return {
    locales
  };
};
