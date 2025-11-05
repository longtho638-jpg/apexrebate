import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import DashboardClient from './dashboard-client';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard - ApexRebate',
    template: '%s | ApexRebate'
  },
  description: 'Dashboard phân tích trading hiệu suất cao của ApexRebate. Theo dõi hiệu suất hoàn phí, phân tích giao dịch, và tối ưu hóa lợi nhuận với AI-powered insights.',
  keywords: [
    'dashboard trading',
    'phân tích giao dịch',
    'hiệu suất trading',
    'theo dõi lợi nhuận',
    'trading analytics',
    'crypto dashboard',
    'ApexRebate dashboard',
    'biểu đồ trading',
    'phân tích kỹ thuật',
    'tối ưu hóa lợi nhuận',
    'AI trading insights',
    'performance metrics'
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
    url: '/dashboard',
    title: 'Dashboard Trading Analytics - ApexRebate',
    description: 'Phân tích hiệu suất trading chuyên sâu với biểu đồ tương tác và AI-powered insights',
    siteName: 'ApexRebate',
    images: [
      {
        url: '/og-dashboard.jpg',
        width: 1200,
        height: 630,
        alt: 'ApexRebate Dashboard - Trading Analytics Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard Trading Analytics - ApexRebate',
    description: 'Phân tích hiệu suất trading với biểu đồ tương tác và AI insights',
    images: ['/og-dashboard.jpg'],
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
    canonical: '/dashboard',
    languages: {
      'vi-VN': '/vi/dashboard',
      'en-US': '/en/dashboard',
    },
  },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/vi/auth/signin?callbackUrl=/dashboard');
  }

  return <DashboardClient />;
}