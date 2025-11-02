import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['vi', 'en'] as const;
const defaultLocale = 'vi' as const;

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is defined with fallback
  const currentLocale = locale || defaultLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(currentLocale as any)) notFound();

  return {
    locale: currentLocale,
    messages: (await import(`../messages/${currentLocale}.json`)).default,
    timeZone: 'Asia/Ho_Chi_Minh',
  };
});

export { locales, defaultLocale };