import { Metadata } from 'next'
import { generateMetadata, getPageSEO } from '@/lib/seo'

interface PageProps {
  params: { locale: string }
}

export async function generatePageMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = params.locale || 'vi'
  const pageSEO = getPageSEO('home', locale)
  
  return generateMetadata({
    ...pageSEO,
    canonical: `https://apexrebate.com/${locale}`,
    alternateLanguages: {
      'vi': 'https://apexrebate.com/vi',
      'en': 'https://apexrebate.com/en',
    }
  })
}