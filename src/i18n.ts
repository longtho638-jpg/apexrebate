import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['vi', 'en'] as const;
const defaultLocale = 'vi' as const;

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  // If invalid, use default locale instead of throwing notFound
  const validLocale = (locales.includes(locale as any) ? locale : defaultLocale) as string;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
    timeZone: 'Asia/Ho_Chi_Minh',
    defaultLocale,
    locales
  };
});

export { locales, defaultLocale };