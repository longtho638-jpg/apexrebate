import Providers from '@/components/providers'
import { SiteFooter } from '@/components/uiux-v3/site-footer'
import { SiteHeader } from '@/components/uiux-v3/site-header'
import { Toaster } from '@/components/ui/toaster'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'

export default async function UiUxV3Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = 'en'
  const messages = await getMessages({ locale })
  const t = await getTranslations({ locale, namespace: 'uiuxV3' })

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <a href="#main-content" className="skip-link" data-i18n="skip.main">
              {t('skip.main')}
            </a>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main id="main-content" className="flex-1 pb-16 pt-8">
                <div className="container flex max-w-6xl flex-col gap-16">{children}</div>
              </main>
              <SiteFooter />
            </div>
            <Toaster />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
