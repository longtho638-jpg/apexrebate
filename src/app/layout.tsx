import Providers from '@/components/providers'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { getMessages } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages()

  return (
    <Providers locale="vi" messages={messages}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </Providers>
  )
}