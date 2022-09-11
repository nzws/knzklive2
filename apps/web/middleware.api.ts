import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, SupportedLocale, supportedLocales } from './locales';

const PUBLIC_FILE = /\.(.*)$/;
const LOCALE_COOKIE = 'KNZK_LOCALE';
const ONE_YEAR = 60 * 60 * 24 * 365;

const getLocale = (req: NextRequest) => {
  const { headers, cookies } = req;

  const cookieLang = cookies.get(LOCALE_COOKIE);
  if (cookieLang) {
    return cookieLang;
  }

  const acceptLanguage = headers.get('accept-language');
  if (!acceptLanguage) {
    return defaultLocale;
  }

  const [lang] = acceptLanguage.split(',');

  return lang.toLowerCase().split('-')[0] || defaultLocale;
};

export const middleware = (req: NextRequest) => {
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api/') ||
    PUBLIC_FILE.test(req.nextUrl.pathname)
  ) {
    return;
  }

  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host');

  if (!hostname) {
    return new Response(null, {
      status: 400,
      statusText: 'Bad Request'
    });
  }

  if (pathname.startsWith('/app')) {
    return new Response(null, {
      status: 400
    });
  }

  const paramLang = url.searchParams.get('lang');
  const language = paramLang || getLocale(req);
  const validLang = supportedLocales.includes(language as SupportedLocale)
    ? language
    : defaultLocale;

  url.pathname = `/app/${validLang}/${hostname}${pathname}`;
  const response = NextResponse.rewrite(url);
  if (paramLang && paramLang === validLang) {
    response.cookies.set(LOCALE_COOKIE, validLang, {
      maxAge: ONE_YEAR
    });
  }

  return response;
};
