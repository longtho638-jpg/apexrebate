import { NextIntlClientProvider } from 'next-intl';
import { Inter } from 'next/font/google';
import viMessages from '@/../messages/vi.json';
import enMessages from '@/../messages/en.json';

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

  // Use static imports to avoid dynamic import serialization issues
  const messages = effectiveLocale === 'vi' ? viMessages : enMessages;

  return (
    <NextIntlClientProvider locale={effectiveLocale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}