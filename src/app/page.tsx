'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import HomePageClient from './homepage-client'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Chỉ redirect nếu user đã đăng nhập
    if (status === 'authenticated' && session) {
      const preferredLocale = localStorage.getItem('preferred-locale') || 'vi'
      router.push(`/${preferredLocale}/dashboard`)
    }
  }, [status, session, router])

  // Hiển thị Homepage cho tất cả (đăng nhập hoặc chưa đăng nhập)
  return <HomePageClient />
}
