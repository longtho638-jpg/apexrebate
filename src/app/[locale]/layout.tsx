import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { LocaleSync } from './locale-sync'
import RootLayoutClient from '../layout-client'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const resolvedParams = await params
  const messages = await getMessages()
  return (
    <NextIntlClientProvider messages={messages} locale={resolvedParams.locale}>
      <RootLayoutClient>
        <LocaleSync />
        {children}
      </RootLayoutClient>
    </NextIntlClientProvider>
  )
}
