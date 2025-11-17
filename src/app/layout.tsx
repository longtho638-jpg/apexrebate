import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '@/components/providers'
import { OrganizationStructuredData, WebsiteStructuredData } from '@/components/structured-data'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://apexrebate.com'),
  title: {
    default: 'ApexRebate - Tối ưu hóa lợi nhuận cho trader nghiêm túc',
    template: '%s | ApexRebate',
  },
  description:
    'Nền tảng hoàn phí minh bạch nhất cho trader nghiêm túc. Chúng tôi không hứa hẹn làm giàu nhanh, chúng tôi cung cấp công cụ tối ưu hóa dựa trên dữ liệu.',
  keywords: [
    'hoàn phí trading',
    'crypto rebate',
    'tối ưu hóa lợi nhuận',
    'trading fees',
    'binance rebate',
    'bybit rebate',
    'OKX rebate',
    'trader tools',
    'phân tích hiệu suất',
    'trading analytics',
  ],
  authors: [{ name: 'ApexRebate Team' }],
  creator: 'ApexRebate',
  publisher: 'ApexRebate',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://apexrebate.com',
    siteName: 'ApexRebate',
    title: 'ApexRebate - Tối ưu hóa lợi nhuận cho trader nghiêm túc',
    description: 'Nền tảng hoàn phí minh bạch nhất cho trader nghiêm túc.',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'ApexRebate Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ApexRebate - Tối ưu hóa lợi nhuận cho trader nghiêm túc',
    description: 'Nền tảng hoàn phí minh bạch nhất cho trader nghiêm túc.',
    images: ['/logo.svg'],
    creator: '@apexrebate',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add when ready
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OrganizationStructuredData />
        <WebsiteStructuredData />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
