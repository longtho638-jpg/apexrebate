export const DashboardLayout = ({
  sidebar,
  main,
}: {
  sidebar: React.ReactNode
  main: React.ReactNode
}) => (
  <div className="min-h-screen bg-gradient-to-br from-[#050B16] via-[#0A1B30] to-[#050B16] px-6 py-10 text-white">
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[280px,1fr]">
      <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">{sidebar}</aside>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">{main}</section>
    </div>
  </div>
)
