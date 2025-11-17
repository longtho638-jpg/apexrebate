export const StatsSection = () => (
  <section className="mt-12">
    <div className="grid gap-6 md:grid-cols-4">
      {[
        { label: 'Total Users', value: '10K+' },
        { label: 'Total Volume', value: '$2.5M' },
        { label: 'Active Traders', value: '1,200' },
        { label: 'Payouts', value: '$450K' }
      ].map((stat, i) => (
        <div key={i} className="text-center">
          <div className="text-3xl font-bold">{stat.value}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
        </div>
      ))}
    </div>
  </section>
)
