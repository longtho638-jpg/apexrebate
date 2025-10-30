'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { NextIntlClientProvider } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

interface ProvidersProps {
  children: ReactNode
  locale?: string
  messages?: any
}

export default function Providers({ children, locale = 'vi', messages }: ProvidersProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <SessionProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  )
}