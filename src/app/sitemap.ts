import { MetadataRoute } from 'next'

const baseUrl = 'https://apexrebate.com'
const locales = ['vi', 'en', 'th', 'id'] as const

// Static pages that exist in all locales
const staticPages = [
  '',
  '/calculator',
  '/wall-of-fame',
  '/hang-soi',
  '/tools-market',
  '/faq',
  '/how-it-works',
  '/concierge',
  '/concierge/claim',
] as const

// Auth pages (lower priority)
const authPages = ['/auth/signin', '/auth/signup'] as const

// V5 UI pages
const v5Pages = ['/v5/home', '/v5/dashboard', '/v5/calculator', '/v5/settings'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date()

  // Generate sitemap entries for all locales + static pages
  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1.0 : page === '/calculator' ? 0.9 : 0.8,
    }))
  )

  // Auth pages (all locales)
  const authEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    authPages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
  )

  // V5 pages (all locales)
  const v5Entries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    v5Pages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )

  // Root redirects
  const rootEntry: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]

  return [...rootEntry, ...staticEntries, ...authEntries, ...v5Entries]
}
