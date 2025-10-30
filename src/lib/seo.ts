import { Metadata } from 'next'

export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  openGraph?: {
    title?: string
    description?: string
    images?: string[]
    type?: string
    locale?: string
    siteName?: string
  }
  twitter?: {
    card?: 'summary' | 'summary_large_image'
    title?: string
    description?: string
    images?: string[]
  }
  canonical?: string
  noindex?: boolean
  alternateLanguages?: Record<string, string>
}

const defaultSEO: SEOConfig = {
  title: 'ApexRebate - Tối ưu hóa lợi nhuận cho trader nghiêm túc',
  description: 'ApexRebate giúp các trader crypto tiết kiệm đến 40% phí giao dịch thông qua chương trình hoàn phí minh bạch. Dịch vụ concierge tận tâm cho nhà giao dịch chuyên nghiệp.',
  keywords: [
    'crypto rebate',
    'hoàn phí crypto',
    'trading fee discount',
    'Binance rebate',
    'Bybit rebate',
    'OKX rebate',
    'trader vietnam',
    'giao dịch crypto',
    'tối ưu lợi nhuận',
    'cashback trading'
  ],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'ApexRebate',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ApexRebate - Tối ưu hóa lợi nhuận cho trader'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/twitter-image.png']
  }
}

export function generateMetadata(config: Partial<SEOConfig>): Metadata {
  const seo = { ...defaultSEO, ...config }
  
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords?.join(', '),
    authors: [{ name: 'ApexRebate Team' }],
    creator: 'ApexRebate',
    publisher: 'ApexRebate',
    
    openGraph: {
      title: seo.openGraph?.title || seo.title,
      description: seo.openGraph?.description || seo.description,
      type: seo.openGraph?.type || 'website',
      locale: seo.openGraph?.locale || 'vi_VN',
      siteName: seo.openGraph?.siteName || 'ApexRebate',
      images: seo.openGraph?.images || [],
    },
    
    twitter: {
      card: seo.twitter?.card || 'summary_large_image',
      title: seo.twitter?.title || seo.title,
      description: seo.twitter?.description || seo.description,
      images: seo.twitter?.images || [],
      creator: '@ApexRebate',
    },
    
    robots: {
      index: !seo.noindex,
      follow: !seo.noindex,
      googleBot: {
        index: !seo.noindex,
        follow: !seo.noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_SITE_VERIFICATION,
    },
    
    alternates: {
      canonical: seo.canonical,
      languages: seo.alternateLanguages || {
        'vi': '/vi',
        'en': '/en',
      },
    },
    
    other: {
      'theme-color': '#2563eb',
      'msapplication-TileColor': '#2563eb',
    },
  }
}

export function getPageSEO(page: string, locale: string = 'vi'): Partial<SEOConfig> {
  const seoConfigs: Record<string, Record<string, Partial<SEOConfig>>> = {
    home: {
      vi: {
        title: 'ApexRebate - Tối ưu hóa lợi nhuận cho trader nghiêm túc',
        description: 'ApexRebate giúp các trader crypto Việt Nam tiết kiệm đến 40% phí giao dịch. Dịch vụ concierge tận tâm, minh bạch tuyệt đối cho nhà giao dịch chuyên nghiệp.',
        keywords: ['rebate crypto', 'hoàn phí', 'trader vietnam', 'binance rebate', 'bybit rebate']
      },
      en: {
        title: 'ApexRebate - Optimize Profits for Serious Traders',
        description: 'Save up to 40% on trading fees with ApexRebate. Transparent cashback service with personalized concierge support for professional crypto traders.',
        keywords: ['crypto rebate', 'trading fee discount', 'cashback trading', 'binance rebate', 'bybit rebate']
      }
    },
    calculator: {
      vi: {
        title: 'Tính toán Hoàn phí - ApexRebate',
        description: 'Công cụ tính toán tiết kiệm phí giao dịch chính xác. Xem bạn có thể tiết kiệm bao nhiêu với ApexRebate.',
        keywords: ['tính toán rebate', 'công cụ tiết kiệm phí', 'trading fee calculator']
      },
      en: {
        title: 'Rebate Calculator - ApexRebate',
        description: 'Calculate your potential trading fee savings with our accurate rebate calculator. See how much you can save with ApexRebate.',
        keywords: ['rebate calculator', 'trading fee calculator', 'crypto savings calculator']
      }
    },
    'wall-of-fame': {
      vi: {
        title: 'Wall of Fame - ApexRebate',
        description: 'Bảng vinh danh các trader xuất sắc nhất của ApexRebate. Xem thành tích và phần thưởng của cộng đồng.',
        keywords: ['wall of fame', 'bảng vinh danh', 'trader xuất sắc', 'thành tích trading']
      },
      en: {
        title: 'Wall of Fame - ApexRebate',
        description: 'Hall of fame for top ApexRebate traders. View achievements and rewards from our elite trading community.',
        keywords: ['wall of fame', 'top traders', 'trading achievements', 'elite traders']
      }
    },
    dashboard: {
      vi: {
        title: 'Dashboard - ApexRebate',
        description: 'Quản lý tài khoản và theo dõi hiệu suất giao dịch của bạn. Phân tích chi tiết và thống kê tiết kiệm phí.',
        keywords: ['dashboard trader', 'quản lý tài khoản', 'thống kê giao dịch', 'phân tích trading']
      },
      en: {
        title: 'Dashboard - ApexRebate',
        description: 'Manage your account and track trading performance. Detailed analytics and fee savings statistics.',
        keywords: ['trading dashboard', 'account management', 'trading analytics', 'performance tracking']
      }
    },
    'hang-soi': {
      vi: {
        title: 'Hang Sói - Cộng đồng Elite - ApexRebate',
        description: 'Cộng đồng riêng tư dành cho 100 trader ưu tú nhất. Thảo luận chuyên sâu, chia sẻ chiến lược và cơ hội độc quyền.',
        keywords: ['hang soi', 'cộng đồng trader', 'elite community', 'trader club']
      },
      en: {
        title: "Wolf's Den - Elite Community - ApexRebate",
        description: 'Private community for top 100 elite traders. Deep discussions, strategy sharing, and exclusive opportunities.',
        keywords: ['wolf den', 'trading community', 'elite traders', 'private club']
      }
    },
    'apex-pro': {
      vi: {
        title: 'ApexPro - Công cụ Phân tích Chuyên sâu - ApexRebate',
        description: 'Công cụ phân tích trading nâng cao với dashboard chuyên nghiệp. Tối ưu hóa chiến lược và quản lý rủi ro.',
        keywords: ['apex pro', 'công cụ trading', 'phân tích kỹ thuật', 'dashboard chuyên nghiệp']
      },
      en: {
        title: 'ApexPro - Advanced Analytics Tools - ApexRebate',
        description: 'Advanced trading analytics with professional dashboard. Optimize strategies and risk management.',
        keywords: ['apex pro', 'trading tools', 'technical analysis', 'professional dashboard']
      }
    }
  }
  
  return seoConfigs[page]?.[locale] || {}
}

export function generateStructuredData(type: string, data: any) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  }
  
  return {
    __html: JSON.stringify(structuredData)
  }
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{name: string, url: string}>) {
  return generateStructuredData('BreadcrumbList', {
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  })
}

export function generateOrganizationSchema() {
  return generateStructuredData('Organization', {
    name: 'ApexRebate',
    url: 'https://apexrebate.com',
    logo: 'https://apexrebate.com/logo.png',
    description: 'Tối ưu hóa lợi nhuận cho trader nghiêm túc thông qua chương trình hoàn phí minh bạch',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+84-123-456-789',
      contactType: 'customer service',
      availableLanguage: ['Vietnamese', 'English']
    },
    sameAs: [
      'https://twitter.com/ApexRebate',
      'https://facebook.com/ApexRebate',
      'https://linkedin.com/company/apexrebate'
    ]
  })
}

export function generateWebsiteSchema() {
  return generateStructuredData('WebSite', {
    name: 'ApexRebate',
    url: 'https://apexrebate.com',
    description: 'Tối ưu hóa lợi nhuận cho trader nghiêm túc thông qua chương trình hoàn phí minh bạch',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://apexrebate.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  })
}

export function generateServiceSchema() {
  return generateStructuredData('Service', {
    name: 'Crypto Trading Rebate Service',
    description: 'Minh bạch hóa và tối ưu hóa phí giao dịch crypto cho các trader chuyên nghiệp',
    provider: {
      '@type': 'Organization',
      name: 'ApexRebate'
    },
    serviceType: 'Trading Fee Rebate Service',
    areaServed: 'Worldwide',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Trading Rebate Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Binance Rebate',
            description: 'Hoàn phí lên đến 40% cho giao dịch Binance Futures'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Bybit Rebate',
            description: 'Hoàn phí lên đến 35% cho giao dịch Bybit Derivatives'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'OKX Rebate',
            description: 'Hoàn phí lên đến 30% cho giao dịch OKX Futures'
          }
        }
      ]
    }
  })
}