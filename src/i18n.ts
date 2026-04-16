import { getRequestConfig } from 'next-intl/server';

const SUPPORTED_LOCALES = ['vi', 'en', 'ko'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function isSupportedLocale(locale: string | undefined): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const raw = await requestLocale;
  const locale: SupportedLocale = isSupportedLocale(raw) ? raw : 'vi';
  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
