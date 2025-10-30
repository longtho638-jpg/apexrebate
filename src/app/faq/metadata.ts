import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Câu hỏi thường gặp - ApexRebate',
    template: '%s | ApexRebate'
  },
  description: 'Tìm câu trả lời cho tất cả câu hỏi về dịch vụ hoàn phí giao dịch ApexRebate. Hướng dẫn chi tiết cho trader về quy trình, bảo mật, và cách tối ưu hóa lợi nhuận.',
  keywords: [
    'FAQ ApexRebate',
    'câu hỏi thường gặp',
    'hoàn phí giao dịch',
    'dịch vụ concierge',
    'trader Việt Nam',
    'Binance rebate',
    'Bybit rebate',
    'OKX rebate',
    'bảo mật giao dịch',
    'quy trình hoàn phí',
    'tối ưu lợi nhuận',
    'ApexRebate hướng dẫn',
    'cashback crypto',
    'rebate trading'
  ],
  authors: [{ name: 'ApexRebate Team' }],
  creator: 'ApexRebate',
  publisher: 'ApexRebate',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/faq',
    title: 'Câu hỏi thường gặp - ApexRebate',
    description: 'Trung tâm trợ giúp ApexRebate - Tất cả câu hỏi về dịch vụ hoàn phí giao dịch cho trader Việt Nam',
    siteName: 'ApexRebate',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FAQ ApexRebate - Câu hỏi thường gặp về hoàn phí giao dịch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Câu hỏi thường gặp - ApexRebate',
    description: 'Tìm câu trả lời chi tiết về dịch vụ hoàn phí giao dịch ApexRebate',
    images: ['/og-image.jpg'],
    creator: '@ApexRebate',
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
  alternates: {
    canonical: '/faq',
    languages: {
      'vi-VN': '/vi/faq',
      'en-US': '/en/faq',
    },
  },
};