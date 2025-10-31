import Providers from '@/components/providers'
import { SiteFooter } from '@/components/uiux-v3/site-footer'
import { SiteHeader } from '@/components/uiux-v3/site-header'
import { Toaster } from '@/components/ui/toaster'
import { getMessages } from 'next-intl/server'

export default async function UiUxV3Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages()

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <Providers locale="vi" messages={messages}>
          <a href="#main-content" className="skip-link" data-i18n="skip.main">
            Bỏ qua tới nội dung chính
          </a>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main id="main-content" className="flex-1 pb-16 pt-8">
              <div className="container flex max-w-6xl flex-col gap-16">
                {children}
              </div>
            </main>
            <SiteFooter />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
