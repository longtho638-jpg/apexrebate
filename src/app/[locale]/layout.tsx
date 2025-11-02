import { NextIntlClientProvider } from 'next-intl';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  // Be lenient in production: fallback to default locale instead of 404
  const SUPPORTED_LOCALES = ['vi', 'en'] as const;
  const effectiveLocale = (SUPPORTED_LOCALES as readonly string[]).includes(locale)
    ? locale
    : 'vi';

  // Load plain JSON messages explicitly to avoid any prod bundling quirks
  // Note: Keep messages as a serializable object for the Client Provider
  const messages = (await import(`../../../messages/${effectiveLocale}.json`)).default;

  return (
    <NextIntlClientProvider locale={effectiveLocale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}