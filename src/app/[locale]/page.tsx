'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import HomePageClient from '@/app/homepage-client'

export default function LocaleHome({ params }: { params: { locale: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const locale = params?.locale || 'en'

  useEffect(() => {
    // Chỉ redirect nếu user đã đăng nhập
    if (status === 'authenticated' && session) {
      router.push(`/${locale}/dashboard`)
    }
  }, [status, session, locale, router])

  // Hiển thị Homepage cho tất cả (đăng nhập hoặc chưa đăng nhập)
  return <HomePageClient />
}
