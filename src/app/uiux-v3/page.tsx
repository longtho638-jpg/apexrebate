'use client'

export const dynamic = 'force-dynamic'

import dynamic from 'next/dynamic'

const CICDPage = dynamic(() => import('@/components/cicd/cicd-page'), {
  ssr: false,
})

export default function UIUXV3Page() {
  return <CICDPage />
}
