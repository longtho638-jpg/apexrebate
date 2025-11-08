'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages } from 'lucide-react'

const locales = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('navigation')

  const switchLocale = (newLocale: string) => {
    // Remove current locale prefix from pathname
    // e.g., /en/dashboard → /dashboard or /dashboard → /dashboard
    const pathWithoutLocale = pathname.replace(/^\/(en|vi)(\/|$)/, '$2') || '/'
    
    // Build new path with new locale prefix
    // vi is default (no prefix), en requires /en prefix
    const newPath = newLocale === 'vi' 
      ? pathWithoutLocale 
      : `/en${pathWithoutLocale}`
    
    // Preserve query parameters
    const queryString = searchParams.toString()
    const finalPath = queryString ? `${newPath}?${queryString}` : newPath
    
    router.push(finalPath)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{t('language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => switchLocale(lang.code)}
            className={`cursor-pointer ${locale === lang.code ? 'bg-accent' : ''}`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
