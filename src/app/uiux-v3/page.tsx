'use client'

// Trang UI/UX v3 chạy client-only để tránh lỗi SSR trên Vercel.
export const dynamic = 'force-dynamic'

import dynamic from 'next/dynamic'
import React from 'react'

// Lazy-load dashboard để giảm time-to-interactive cho page shell
const CICDPage = dynamic(() => import('@/components/cicd/cicd-page'), {
  ssr: false,
})

export default function UIUXV3Page() {
  return <CICDPage />
}
