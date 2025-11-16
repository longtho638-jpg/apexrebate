import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const SUPPORTED_LOCALES = ['vi', 'th', 'id', 'en'] as const;

async function detectPreferredLocale(): Promise<string> {
  const headerList = await headers();
  const acceptLanguage = headerList.get('accept-language') || '';
  for (const locale of SUPPORTED_LOCALES) {
    if (acceptLanguage.toLowerCase().includes(locale)) {
      return locale;
    }
  }
  return 'en';
}

export default async function AdminRootRedirect() {
  const preferredLocale = await detectPreferredLocale();
  redirect(`/${preferredLocale}/admin`);
}
