import Script from 'next/script'

export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ApexRebate',
    url: 'https://apexrebate.com',
    logo: 'https://apexrebate.com/logo.svg',
    description:
      'Nền tảng hoàn phí minh bạch nhất cho trader nghiêm túc. Tối ưu hóa lợi nhuận trading với công cụ dựa trên dữ liệu.',
    sameAs: [
      // Add social media URLs when available
      // 'https://twitter.com/apexrebate',
      // 'https://facebook.com/apexrebate',
      // 'https://linkedin.com/company/apexrebate',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['vi', 'en', 'th', 'id'],
    },
  }

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function WebsiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ApexRebate',
    url: 'https://apexrebate.com',
    description:
      'Nền tảng hoàn phí minh bạch nhất cho trader nghiêm túc. Tối ưu hóa lợi nhuận trading với công cụ dựa trên dữ liệu.',
    inLanguage: ['vi', 'en', 'th', 'id'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://apexrebate.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
