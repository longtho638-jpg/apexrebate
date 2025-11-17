'use client'

import useSWR from 'swr'
import { DashboardLayout } from '@/uiux-v5/layouts/dashboard-layout'
import { DashboardHeader } from '@/uiux-v5/organisms/dashboard-header'
import { DashboardMetrics } from '@/uiux-v5/organisms/dashboard-metrics'
import { ReferralGraph } from '@/uiux-v5/organisms/referral-graph'
import Button from '@/uiux-v5/atoms/Button'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export const DashboardPreview = () => {
  const { data, isLoading } = useSWR('/api/dashboard', fetcher)

  const metrics = [
    { label: 'Rank', value: data?.data?.userData?.rank ?? '#08' },
    { label: 'Volume', value: `$${data?.data?.monthlyVolume ?? '1.5M'}` },
    { label: 'Savings', value: `$${data?.data?.savings ?? '120K'}` },
    { label: 'Level', value: data?.data?.userData?.level ?? 'Elite' },
  ]

  const secondary = [
    { title: 'Tiết kiệm hôm nay', value: `$${data?.data?.dailySavings ?? '12,400'}` },
    { title: 'Payout pending', value: `$${data?.data?.pendingPayouts ?? '42,000'}` },
    { title: 'Active referrals', value: data?.data?.activeReferrals ?? '32' },
  ]

  return (
    <DashboardLayout
      sidebar={
        <div className="space-y-4">
          <Button className="w-full">Nạp tiền</Button>
          <Button className="w-full" variant="outline">
            Rút tiền
          </Button>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <p>Referral link:</p>
            <p className="mt-1 font-semibold text-white">apexrebate.com/ref/TM-9382</p>
          </div>
        </div>
      }
      main={
        <div className="space-y-6">
          <DashboardHeader metrics={metrics} />
          <DashboardMetrics loading={isLoading} data={secondary} />
          <ReferralGraph />
        </div>
      }
    />
  )
}
