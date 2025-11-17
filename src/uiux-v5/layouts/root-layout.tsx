import Navbar from '@/uiux-v5/organisms/navbar'
import Footer from '@/uiux-v5/organisms/footer'

export const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#050B16] text-white">
    <Navbar />
    <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>
    <Footer />
  </div>
)
