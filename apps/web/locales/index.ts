export const supportedLocales = ['en', 'ja'] as const;
export type SupportedLocale = typeof supportedLocales[number];

export const localeNames: Record<SupportedLocale, string> = {
  en: 'English',
  ja: '日本語'
} as const;

export const defaultLocale = 'en';
