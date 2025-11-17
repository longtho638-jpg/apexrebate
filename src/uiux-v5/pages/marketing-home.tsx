import Hero from '@/uiux-v5/organisms/Hero'
import { FeatureGrid } from '@/uiux-v5/organisms/feature-grid'
import { StatsSection } from '@/uiux-v5/organisms/stats-section'
import { PartnerLogoGrid } from '@/uiux-v5/molecules/partner-logo-grid'
import { CTASection } from '@/uiux-v5/organisms/cta-section'
import { FAQSection } from '@/uiux-v5/organisms/faq-section'
import { MarketingLayout } from '@/uiux-v5/layouts/marketing-layout'
import { ToolCard } from '@/uiux-v5/molecules/tool-card'
import { MemberCard } from '@/uiux-v5/molecules/member-card'
import { FlipCard } from '@/uiux-v5/molecules/flip-card'

const partners = [
  { name: 'Binance', logo: '' },
  { name: 'Upbit', logo: '' },
  { name: 'OKX', logo: '' },
  { name: 'Coinbase', logo: '' },
]

const tools = [
  {
    name: 'Elite Cashback Engine',
    description: 'Kết nối 4 sàn lớn, payout D+1, tracking realtime.',
    category: 'Automation'
  },
  {
    name: 'SLO Guardrail',
    description: 'Theo dõi latency & error-rate, auto rollback.',
    category: 'Observability'
  },
  {
    name: 'Concierge Loop',
    description: 'Onboard trader VIP với workflow 2 bước.',
    category: 'Workflow'
  },
]

const community = [
  { name: 'Phượng Hoàng', tier: 'Legend', points: '1.2B vol' },
  { name: 'X Hunter', tier: 'Alpha', points: '840M vol' },
  { name: 'Team Em Gái', tier: 'Rising', points: '210M vol' },
]

export const MarketingHome = () => (
  <MarketingLayout>
    <Hero />
    <FeatureGrid />
    <StatsSection />

    <section className="mt-20">
      <p className="text-sm uppercase tracking-[0.5rem] text-white/60">Đối tác chiến lược</p>
      <PartnerLogoGrid partners={partners} />
    </section>

    <section id="tools" className="mt-20">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Tools Marketplace</h2>
        <p className="text-sm text-white/60">Public browsing, auth cho upload</p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.name} {...tool} />
        ))}
      </div>
    </section>

    <section id="community" className="mt-20">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold">Hang Sói</h2>
          <p className="mt-2 text-white/70">Cộng đồng copy trade mạnh với hệ thống tier và badges.</p>
          <div className="mt-6 space-y-4">
            {community.map((member) => (
              <MemberCard key={member.name} {...member} />
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <FlipCard front={<p className="text-center text-lg font-semibold">Achievement Glow</p>} back={<p className="text-center text-sm">Theo dõi hành trình lên tier bằng motion 3D.</p>} />
          <FlipCard front={<p className="text-center text-lg font-semibold">Volume Graph</p>} back={<p className="text-center text-sm">Heatmap volume theo sàn & thời gian.</p>} />
        </div>
      </div>
    </section>

    <FAQSection />
    <CTASection />
  </MarketingLayout>
)
